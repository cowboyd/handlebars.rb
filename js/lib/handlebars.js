// lib/handlebars/parser.js
;
// lib/handlebars/compiler.js
var Handlebars = {};

Handlebars.Parser = handlebars;

Handlebars.parse = function(string) {
  Handlebars.Parser.yy = Handlebars.AST;
  Handlebars.Parser.lexer = new Handlebars.HandlebarsLexer();
  return Handlebars.Parser.parse(string);
};

Handlebars.print = function(ast) {
  return new Handlebars.PrintVisitor().accept(ast);
};

Handlebars.compile = function(string) {
  var ast = Handlebars.parse(string);

  return function(context, helpers, partials) {
    var helpers, partials;

    if(!helpers) {
      helpers  = Handlebars.helpers;
    }

    if(!partials) {
      partials = Handlebars.partials;
    }

    var internalContext = new Handlebars.Context(context, helpers, partials);
    var runtime = new Handlebars.Runtime(internalContext);
    runtime.accept(ast);
    return runtime.buffer;
  };
};

Handlebars.helpers  = {};
Handlebars.partials = {};

Handlebars.registerHelper = function(name, fn, inverse) {
  if(inverse) { fn.not = inverse; }
  this.helpers[name] = fn;
};

Handlebars.registerPartial = function(name, str) {
  this.partials[name] = str;
};

Handlebars.registerHelper('blockHelperMissing', function(context, fn, inverse) {
  inverse = inverse || function() {};

  var ret = "";
  var type = Object.prototype.toString.call(context);

  if(type === "[object Function]") {
    context = context();
  }

  if(context === true) {
    return fn(this);
  } else if(context === false || context == null) {
    return inverse(this);
  } else if(type === "[object Array]") {
    if(context.length > 0) {
      for(var i=0, j=context.length; i<j; i++) {
        ret = ret + fn(context[i]);
      }
    } else {
      ret = inverse(this);
    }
    return ret;
  } else {
		return fn(context);
	}
}, function(context, fn) {
  return fn(context)
});

Handlebars.registerHelper('each', function(context, fn, inverse) {
  var ret = "";

  if(context.length > 0) {
    for(var i=0, j=context.length; i<j; i++) {
      ret = ret + fn(context[i]);
    }
  } else {
    ret = inverse(this);
  }
  return ret;
});

Handlebars.registerHelper('if', function(context, fn, inverse) {
  if(context === false || context == null) {
    return inverse(this);
  } else {
    return fn(this);
  }
});
;
// lib/handlebars/ast.js
(function() {

  Handlebars.AST = {};

  Handlebars.AST.ProgramNode = function(statements, inverse) {
    this.type = "program";
    this.statements = statements;
    if(inverse) { this.inverse = new Handlebars.AST.ProgramNode(inverse); }
  };

  Handlebars.AST.MustacheNode = function(params, unescaped) {
    this.type = "mustache";
    this.id = params[0];
    this.params = params.slice(1);
    this.escaped = !unescaped;
  };

  Handlebars.AST.PartialNode = function(id, context) {
    this.type    = "partial";

    // TODO: disallow complex IDs

    this.id      = id;
    this.context = context;
  };

  var verifyMatch = function(open, close) {
    if(open.original !== close.original) {
      throw new Handlebars.Exception(open.original + "doesn't match" + close.original);
    }
  };

  Handlebars.AST.BlockNode = function(mustache, program, close) {
    verifyMatch(mustache.id, close);
    this.type = "block";
    this.mustache = mustache;
    this.program  = program;
  };

  Handlebars.AST.InverseNode = function(mustache, program, close) {
    verifyMatch(mustache.id, close);
    this.type = "inverse";
    this.mustache = mustache;
    this.program  = program;
  };

  Handlebars.AST.ContentNode = function(string) {
    this.type = "content";
    this.string = string;
  };

  Handlebars.AST.IdNode = function(parts) {
    this.type = "ID";
    this.original = parts.join("/");

    var dig = [], depth = 0;

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i];

      if(part === "..") { depth++; }
      else if(part === "." || part === "this") { continue; }
      else { dig.push(part); }
    }

    this.parts    = dig;
    this.depth    = depth;
    this.isSimple = (dig.length === 1) && (depth === 0)
  };

  Handlebars.AST.StringNode = function(string) {
    this.type = "STRING";
    this.string = string;
  };

  Handlebars.AST.CommentNode = function(comment) {
    this.type = "comment";
    this.comment = comment;
  };

})();;
// lib/handlebars/jison_ext.js
Handlebars.Lexer = function() {};

Handlebars.Lexer.prototype = {
  setInput: function(input) {
    this.input = input;
    this.matched = this.match = '';
    this.yylineno = 0;
  },

  setupLex: function() {
    this.yyleng = 0;
    this.yytext = '';
    this.match = '';
    this.readchars = 0;
  },

  getchar: function(n) {
    n = n || 1;
    var chars = "", chr = "";

    for(var i=0; i<n; i++) {
      chr = this.input[0];
      chars += chr;
      this.yytext += chr;
      this.yyleng++;

      this.matched += chr;
      this.match += chr;

      if(chr === "\n") { this.yylineno++; }

      this.input = this.input.slice(1);
    }
    return chr;
  },

  readchar: function(n, ignore) {
    n = n || 1;
    var chr;

    for(var i=0; i<n; i++) {
      chr = this.input[i];
      if(chr === "\n") { this.yylineno++; }

      this.matched += chr;
      this.match += chr;
      if(ignore) { this.readchars++; }
    }

    this.input = this.input.slice(n);
  },

  ignorechar: function(n) {
    this.readchar(n, true);
  },

  peek: function(n) {
    return this.input.slice(0, n || 1);
  },

  pastInput:function () {
    var past = this.matched.substr(0, this.matched.length - this.match.length);
    return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
  },

  upcomingInput:function () {
    var next = this.match;
    if (next.length < 20) {
      next += this.input.substr(0, 20-next.length);
    }
    return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
  },

  showPosition:function () {
    var pre = this.pastInput();
    var c = new Array(pre.length + 1 + this.readchars).join("-");
    return pre + this.upcomingInput() + "\n" + c+"^";
  }
};

Handlebars.Visitor = function() {};

Handlebars.Visitor.prototype = {
  accept: function(object) {
    return this[object.type](object);
  }
};;
// lib/handlebars/handlebars_lexer.js
Handlebars.HandlebarsLexer = function() {
  this.state = "CONTENT";
};
Handlebars.HandlebarsLexer.prototype = new Handlebars.Lexer();

// The HandlebarsLexer uses a Lexer interface that is compatible
// with Jison.
//
// setupLex      reset internal state for a new token
// peek(n)       lookahead n characters and return (default 1)
// getchar(n)    remove n characters from the input and add
//               them to the matched text (default 1)
// readchar(n)   remove n characters from the input, but do not
//               add them to the matched text (default 1)
// ignorechar(n) remove n characters from the input, and act
//               as though they were already matched in a
//               previous lex. this will ensure that the
//               pointer in the case of parse errors is in
//               the right place.
Handlebars.HandlebarsLexer.prototype.lex = function() {
  if(this.input === "") { return; }

  this.setupLex();

  var lookahead = this.peek(2);
  var result = '';
  var peek;

  if(lookahead === "") { return; }

  if(this.state == "MUSTACHE") {
    if(this.peek() === "/") {
      this.getchar();
      return "SEP";
    }

    // chomp optional whitespace
    while(this.peek() === " ") { this.ignorechar(); }

    lookahead = this.peek(2);

    // in a mustache, but less than 2 characters left => error
    if(lookahead.length != 2) { return; }

    // if the next characters are '}}', the mustache is done
    if(lookahead === "}}") {
      this.state = "CONTENT";
      this.getchar(2);

      // handle the case of {{{ foo }}} by always chomping
      // a final }. TODO: Track escape state and handle the
      // error condition here
      if(this.peek() == "}") { this.getchar(); }
      return "CLOSE";

    // if the next character is a quote => enter a String
    } else if(this.peek() === '"') {
      this.readchar();

      // scan the String until another quote is reached, skipping over escaped quotes
      while(this.peek() !== '"') { if(this.peek(2) === '\\"') { this.readchar(); } this.getchar(); }
      this.readchar();
      return "STRING";

    // All other cases are IDs or errors
    } else {
      // grab alphanumeric characters
      while(this.peek().match(/[_0-9A-Za-z\.]/)) { this.getchar(); }

      peek = this.peek();
      if(peek !== "}" && peek !== " " && peek !== "/") {
        return;
      }

      // if any characters were grabbed => ID
      if(this.yytext.length) { return "ID"; }

      // Otherwise => Error
      else { return; }
    }

  // Next chars are {{ => Open mustache
  } else if(lookahead == "{{") {
    this.state = "MUSTACHE";
    this.getchar(2);

    peek = this.peek();

    if(peek === ">") {
      this.getchar();
      return "OPEN_PARTIAL";
    } else if(peek === "#") {
      this.getchar();
      return "OPEN_BLOCK";
    } else if(peek === "/") {
      this.getchar();
      return "OPEN_ENDBLOCK";
    } else if(peek === "^") {
      this.getchar();
      return "OPEN_INVERSE";
    } else if(peek === "{" || peek === "&") {
      this.getchar();
      return "OPEN_UNESCAPED";
    } else if(peek === "!") {
      this.readchar();
      this.setupLex(); // reset the lexer state so the yytext is the comment only
      while(this.peek(2) !== "}}") { this.getchar(); }
      this.readchar(2);
      this.state = "CONTENT";
      return "COMMENT";
    } else {
      return "OPEN";
    }

  // Otherwise => content section
  } else {
    while(this.peek(2) !== "{{" && this.peek(2) !== "") { result = result + this.getchar(); }
    return "CONTENT";
  }
};;
// lib/handlebars/runtime.js
// A Context wraps data, and makes it possible to extract a
// new Context given a path. For instance, if the data
// is { person: { name: "Alan" } }, a Context wrapping
// "Alan" can be extracted by searching for "person/name"
Handlebars.Context = function(data, helpers, partials) {
  this.data     = data;
  this.helpers  = helpers || {};
  this.partials = partials || {};
};

Handlebars.Context.prototype = {
  isContext: true,

  // Make a shallow copy of the Context
  clone: function() {
    return new Handlebars.Context(this.data, this.helpers, this.partials);
  },

  // Search for an object inside the Context's data. The
  // path parameter is an object with parts
  // ("person/name" represented as ["person", "name"]),
  // and depth (the amount of levels to go up the stack,
  // originally represented as ..). The stack parameter
  // is the objects already searched from the root of
  // the original Context in order to get to this point.
  //
  // Return a new Context wrapping the data found in
  // the search.
  evaluate: function(path, stack) {
    var context = this.clone();
    var depth = path.depth, parts = path.parts;

    if(depth > stack.length) { context.data = null; }
    else if(depth > 0) { context = stack[stack.length - depth].clone(); }

    for(var i=0,l=parts.length; i<l && context.data != null; i++) {
      context.data = context.data[parts[i]];
    }

    if(context.data !== undefined) { return context; }

    if(parts.length === 1 && context.data === undefined) {
      context.data = context.helpers[parts[0]];
    }

    return context;
  }
};

Handlebars.K = function() { return this; };

Handlebars.proxy = function(obj) {
  var Proxy = this.K;
  Proxy.prototype = obj;
  return new Proxy();
};

Handlebars.Runtime = function(context, stack) {
  this.stack = stack || [];
  this.buffer = "";

  this.context = context;
};

Handlebars.Runtime.prototype = {
  accept: Handlebars.Visitor.prototype.accept,

  ID: function(path) {
    return this.context.evaluate(path, this.stack);
  },

  STRING: function(string) {
    return { data: string.string };
  },

  program: function(program) {
    var statements = program.statements;

    for(var i=0, l=statements.length; i<l; i++) {
      var statement = statements[i];
      this[statement.type](statement);
    }

    return this.buffer;
  },

  mustache: function(mustache) {
    var idObj  = this.ID(mustache.id);
    var params = mustache.params.slice(0);
    var buf;

    for(var i=0, l=params.length; i<l; i++) {
      var param = params[i];
      params[i] = this[param.type](param).data;
    }

    var data = idObj.data;

    var type = toString.call(data);
    var functionType = (type === "[object Function]");

    if(!functionType && params.length) {
      params = params.slice(0);
      params.unshift(data || mustache.id.original);
      data = this.context.helpers.helperMissing;
      functionType = true;
    }

    if(functionType) {
      buf = data.apply(this.wrapContext(), params);
    } else {
      buf = data;
    }

    if(buf && mustache.escaped) { buf = Handlebars.Utils.escapeExpression(buf); }

    this.buffer = this.buffer + ((!buf && buf !== 0) ? '' : buf);
  },

  block: function(block) {
    var mustache = block.mustache, data;

    var id       = mustache.id,
        idObj    = this.ID(mustache.id),
        data     = idObj.data;

    var result;

    if(typeof data === "function") {
      params = this.evaluateParams(mustache.params);
    } else {
      params = [data];
      data   = this.context.helpers.blockHelperMissing;
    }

    params.push(this.wrapProgram(block.program));
    result = data.apply(this.wrapContext(), params);
    this.buffer = this.buffer + ((result === undefined) ? "" : result);

    if(block.program.inverse) {
      params.pop();
      params.push(this.wrapProgram(block.program.inverse));
      result = data.not ? data.not.apply(this.wrapContext(), params) : "";
      this.buffer = this.buffer + result;
    }
  },

  partial: function(partial) {
    var partials = this.context.partials || {};
    var id = partial.id.original;

    var partialBody = partials[partial.id.original];
    var program, context;

    if(!partialBody) {
      throw new Handlebars.Exception("The partial " + partial.id.original + " does not exist");
    }

    if(typeof partialBody === "string") {
      program = Handlebars.parse(partialBody);
      partials[id] = program;
    } else {
      program = partialBody;
    }

    if(partial.context) {
      context = this.ID(partial.context);
    } else {
      context = this.context;
    }
    var runtime = new Handlebars.Runtime(context, this.stack);
    this.buffer = this.buffer + runtime.program(program);
  },

  not: function(context, fn) {
    return fn(context);
  },

  // TODO: Write down the actual spec for inverse sections...
  inverse: function(block) {
    var mustache  = block.mustache,
        id        = mustache.id,
        not;

    var idObj     = this.ID(id),
        data      = idObj.data,
        isInverse = Handlebars.Utils.isEmpty(data);


    var context = this.wrapContext();

    if(toString.call(data) === "[object Function]") {
      params  = this.evaluateParams(mustache.params);
      id      = id.parts.join("/");

      data = data.apply(context, params);
      if(Handlebars.Utils.isEmpty(data)) { isInverse = true; }
      if(data.not) { not = data.not; } else { not = this.not; }
    } else {
      not = this.not;
    }

    var result = not(context, this.wrapProgram(block.program));
    if(result != null) { this.buffer = this.buffer + result; }
    return;
  },

  content: function(content) {
    this.buffer += content.string;
  },

  comment: function() {},

  evaluateParams: function(params) {
    var ret = [];

    for(var i=0, l=params.length; i<l; i++) {
      var param = params[i];
      ret[i] = this[param.type](param).data;
    }

    if(ret.length === 0) { ret = [this.wrapContext()]; }
    return ret;
  },

  wrapContext: function() {
    var data      = this.context.data;
    var proxy     = Handlebars.proxy(data);
    var context   = proxy.__context__ = this.context;
    var stack     = proxy.__stack__   = this.stack.slice(0);

    proxy.__get__ = function(path) {
      path = new Handlebars.AST.IdNode(path.split("/"));
      return context.evaluate(path, stack).data;
    };

    proxy.isWrappedContext = true;
    proxy.__data__         = data;

    return proxy;
  },

  wrapProgram: function(program) {
    var currentContext = this.context;
    var stack = this.stack.slice(0);

    return function(context) {
      if(context && context.isWrappedContext) { context = context.__data__; }

      stack.push(currentContext);
      var newContext = new Handlebars.Context(context, currentContext.helpers, currentContext.partials);
      var runtime = new Handlebars.Runtime(newContext, stack);
      runtime.program(program);
      return runtime.buffer;
    };
  }

};;
// lib/handlebars/utils.js
Handlebars.Exception = function(message) {
  this.message = message;
};

// Build out our basic SafeString type
Handlebars.SafeString = function(string) {
  this.string = string;
};
Handlebars.SafeString.prototype.toString = function() {
  return this.string.toString();
};

(function() {
  var escape = {
    "<": "&lt;",
    ">": "&gt;",
  };

  var badChars = /&(?!\w+;)|[<>]/g;
  var possible = /[&<>]/

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;"
  };

  Handlebars.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string === null) {
        string = "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    },

    isEmpty: function(value) {
      if (typeof value === "undefined") {
        return true;
      } else if (value === null) {
        return true;
      } else if (value === false) {
        return true;
      } else if(Object.prototype.toString.call(value) === "[object Array]" && value.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  };
})();;
// lib/handlebars/vm.js
Handlebars.Compiler = function() {};
Handlebars.JavaScriptCompiler = function() {};

(function(Compiler, JavaScriptCompiler) {
  Compiler.OPCODE_MAP = {
    invokeContent: 1,
    getContext: 2,
    lookupWithFallback: 3,
    lookup: 4,
    append: 5,
    invokeMustache: 6,
    escape: 7,
    pushString: 8,
    truthyOrFallback: 9,
    functionOrFallback: 10,
    invokeProgram: 11,
    invokePartial: 12,
    push: 13,
    invokeInverse: 14
  };

  Compiler.MULTI_PARAM_OPCODES = {
    invokeContent: 1,
    getContext: 1,
    lookupWithFallback: 1,
    lookup: 1,
    invokeMustache: 2,
    pushString: 1,
    truthyOrFallback: 1,
    functionOrFallback: 1,
    invokeProgram: 2,
    invokePartial: 1,
    push: 1,
    invokeInverse: 1
  };

  Compiler.DISASSEMBLE_MAP = {}

  for(prop in Compiler.OPCODE_MAP) {
    var value = Compiler.OPCODE_MAP[prop];
    Compiler.DISASSEMBLE_MAP[value] = prop;
  }

  Compiler.multiParamSize = function(code) {
    return Compiler.MULTI_PARAM_OPCODES[Compiler.DISASSEMBLE_MAP[code]];
  };

  Compiler.prototype = {
    disassemble: function() {
      var opcodes = this.opcodes, opcode, nextCode;
      var out = [], str, name, value;

      for(var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if(opcode === 'DECLARE') {
          name = opcodes[++i];
          value = opcodes[++i];
          out.push("DECLARE " + name + " = " + value);
        } else {
          str = Compiler.DISASSEMBLE_MAP[opcode];

          var extraParams = Compiler.multiParamSize(opcode);
          var codes = [];

          for(var j=0; j<extraParams; j++) {
            nextCode = opcodes[++i];

            if(typeof nextCode === "string") {
              nextCode = "\"" + nextCode.replace("\n", "\\n") + "\"";
            }

            codes.push(nextCode);
          }

          str = str + " " + codes.join(" ");

          out.push(str);
        }
      }

      return out.join("\n")
    },

    guid: 0,

    compile: function(program) {
      this.children = [];
      this.depths = {list: []};
      return this.program(program);
    },

    accept: function(node) {
      return this[node.type](node);
    },

    program: function(program) {
      var statements = program.statements, statement;
      this.opcodes = [];

      for(var i=0, l=statements.length; i<l; i++) {
        statement = statements[i];
        this[statement.type](statement);
      }

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new Compiler().compile(program);
      var guid = this.guid++;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache;
      var params = mustache.params, depth, child, inverse;

      this.pushParams(params);

      // ID lookup is now on the stack
      this.ID(mustache.id);

      var programGuid = this.compileProgram(block.program);

      if(block.program.inverse) {
        var inverseGuid = this.compileProgram(block.program.inverse);
      }

      if(block.program.inverse) {
        this.declare('inverse', inverseGuid);
      }

      this.opcode('invokeProgram', programGuid, params.length);
      this.declare('inverse', null);
      this.opcode('append');
    },

    inverse: function(block) {
      this.ID(block.mustache.id);
      var programGuid = this.compileProgram(block.program);

      this.opcode('invokeInverse', programGuid);
      this.opcode('append');
    },

    partial: function(partial) {
      var id = partial.id;

      if(partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'context');
      }

      this.opcode('invokePartial', id.original);
      this.opcode('append');
    },

    content: function(content) {
      this.opcode('invokeContent', content.string);
    },

    mustache: function(mustache) {
      var params = mustache.params;

      this.pushParams(params);
      this.ID(mustache.id);

      this.opcode('invokeMustache', params.length, mustache.id.original);

      if(mustache.escaped) { this.opcode('escape') }

      this.opcode('append');
    },

    ID: function(id) {
      this.addDepth(id.depth);

      this.opcode('getContext', id.depth);

      this.opcode('lookupWithFallback', id.parts[0] || null);

      for(var i=1, l=id.parts.length; i<l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    comment: function() {},

    pushParams: function(params) {
      var i = params.length, param;

      while(i--) {
        param = params[i];
        this[param.type](param);
      }
    },

    opcode: function(name, val1, val2) {
      this.opcodes.push(Compiler.OPCODE_MAP[name]);
      if(val1 !== undefined) { this.opcodes.push(val1); }
      if(val2 !== undefined) { this.opcodes.push(val2); }
    },

    declare: function(name, value) {
      this.opcodes.push('DECLARE');
      this.opcodes.push(name);
      this.opcodes.push(value);
    },

    addDepth: function(depth) {
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    }
  }

  JavaScriptCompiler.prototype = {
    compile: function(environment) {
      this.preamble();
      this.stackSlot = 0
      this.stackVars = [];
      this.environment = environment;

      this.compileChildren(environment);

      //puts(environment.disassemble());
      //puts("")

      var opcodes = environment.opcodes;
      var opcode, name;
      var declareName, declareVal;

      for(var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if(opcode === 'DECLARE') {
          declareName = opcodes[++i];
          declareVal  = opcodes[++i];
          this[declareName] = declareVal;
        } else {
          name = Compiler.DISASSEMBLE_MAP[opcode];

          var extraParams = Compiler.multiParamSize(opcode);
          var codes = [];

          for(var j=0; j<extraParams; j++) {
            codes.push(opcodes[++i]);
          }

          this[name].apply(this, codes);
        }
      }

      return this.createFunction();
    },

    preamble: function() {
      var out = [];
      out.push("var buffer = '';");
      out.push("var currentContext = context, tmp1, tmp2;");
      out.push("helpers = helpers || Handlebars.helpers; partials = partials || Handlebars.partials;");
      out.push("");

      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.locals = 3;
      this.source = out;
    },

    createFunction: function() {
      var container = {};

      if(this.stackVars.length > 0) {
        this.source[this.locals] = "var " + this.stackVars.join(", ") + ";";
      }

      this.source.push("return buffer;")

      var params = ["context", "helpers", "partials"];

      for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }

      params.push(this.source.join("\n"));

      var fn = Function.apply(this, params);
      fn.displayName = "Handlebars.js"

      //puts(fn.toString())
      //puts("")

      container.render = fn;

      container.children = this.environment.children;

      return function(context, helpers, partials, depth) {
        try {
          return container.render.apply(container, arguments)
        } catch(e) {
          throw e;
        }
      }
    },

    invokeContent: function(content) {
      this.source.push("buffer = buffer + " + this.quotedString(content) + ";");
    },

    append: function() {
      var local = this.popStack();
      this.source.push("buffer = buffer + ((" + local + " || " + local + " === 0) ? " + local + " : '');");
    },

    getContext: function(depth) {
      if(this.lastContext !== depth) {
        this.lastContext = depth;

        if(depth === 0) {
          this.source.push("currentContext = context;");
        } else {
          this.source.push("currentContext = depth" + depth + ";");
        }
        // TODO: handle depths other than 0
      }
    },

    nameLookup: function(parent, name) {
      if(JavaScriptCompiler.RESERVED_WORDS[name]) {
        return parent + "['" + name + "']";
      } else {
        return parent + "." + name;
      }
    },

    lookupWithFallback: function(name) {
      if(name) {
        this.pushStack(this.nameLookup('currentContext', name));
        var topStack = this.topStack();
        this.source.push("if(" + topStack + " == null) { " + topStack + " = " + this.nameLookup('helpers', name) + "; }");
      } else {
        this.pushStack("currentContext");
      }
    },

    lookup: function(name) {
      var topStack = this.topStack();
      this.source.push(topStack + " = " + this.nameLookup(topStack, name) + ";");
    },

    pushString: function(string) {
      this.pushStack(this.quotedString(string));
    },

    push: function(name) {
      this.pushStack(name);
    },

    invokeMustache: function(paramSize, original) {
      this.source.push("tmp1 = " + this.popStack() + ";");
      this.source.push("tmp2 = (typeof tmp1 === 'function');");

      var params = ["context"];

      for(var i=0; i<paramSize; i++) {
        params.push(this.popStack());
      }

      var slot = "stack" + ++this.stackSlot;

      var paramString = params.join(", ");
      var helperMissing = ["context"].concat(this.quotedString(original)).concat(params.slice(1));

      if(paramSize === 0) {
        this.source.push("if(tmp2) { " + slot + " = tmp1.call(" + paramString + "); } else { " + slot + " = tmp1; }");
      } else {
        this.source.push("if(tmp2) { " + slot + " = tmp1.call(" + paramString + "); } else { " + slot + " = helpers.helperMissing.call(" + helperMissing + ") }");
      }
    },

    invokeProgram: function(guid, paramSize) {
      var inverse = this.inverse;

      if(inverse != null) {
        var programParams = ["this.children[" + inverse + "]", "helpers", "partials"];

        var depths = this.environment.rawChildren[guid + 1].depths.list;

        for(var i=0, l = depths.length; i<l; i++) {
          depth = depths[i];

          if(depth === 1) { programParams.push("context"); }
          else { programParams.push("depth" + (depth - 1)); }
        }

        this.source.push("tmp2 = Handlebars.VM.program(" + programParams.join(", ") + ");");
      } else {
        this.source.push("tmp2 = Handlebars.VM.noop;");
      }

      var id = this.topStack();
      var fn = this.popStack();

      var params = ["context"];
      var blockMissingParams = ["context", id];

      for(var i=0; i<paramSize; i++) {
        var param = this.popStack();
        params.push(param);
        blockMissingParams.push(param);
      }

      programParams = ["this.children[" + guid + "]", "helpers", "partials"];
      var depths = this.environment.rawChildren[guid].depths.list, depth;

      for(var i=0, l= depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("context"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      if(depths.length === 0) {
        this.source.push("tmp1 = Handlebars.VM.program(" + programParams.join(", ") + ")");
      } else {
        this.source.push("tmp1 = Handlebars.VM.programWithDepth(" + programParams.join(", ") + ")");
      }

      params.push("tmp1");
      params.push("tmp2");
      blockMissingParams.push("tmp1");
      blockMissingParams.push("tmp2");

      var nextStack = this.nextStack();

      this.source.push("if(typeof " + id + " === 'function') { " + nextStack + " = " + id + ".call(" + params.join(", ") + "); }")
      this.source.push("else { " + nextStack + " = helpers.blockHelperMissing.call(" + blockMissingParams.join(", ") + "); }");
    },

    invokeInverse: function(guid) {
      var depths = this.environment.rawChildren[guid].depths.list;

      programParams = ["this.children[" + guid + "]", "helpers", "partials"];

      for(var i=0, l = depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("context"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      if(depths.length === 0) {
        this.source.push("tmp1 = Handlebars.VM.program(" + programParams.join(", ") + ")");
      } else {
        this.source.push("tmp1 = Handlebars.VM.programWithDepth(" + programParams.join(", ") + ")");
      }

      var blockMissingParams = ["context", this.topStack(), "Handlebars.VM.noop", "tmp1"];
      this.pushStack("helpers.blockHelperMissing.call(" + blockMissingParams.join(", ") + ")");
    },

    invokePartial: function(context) {
      this.pushStack("Handlebars.VM.invokePartial(" + this.nameLookup('partials', context) + ", '" + context + "', " + this.popStack() + ", helpers, partials);");
    },

    escape: function() {
      this.source.push(this.topStack() + " = Handlebars.Utils.escapeExpression(" + this.topStack() + ");");
      // TODO: Escaping
    },

    // HELPERS

    compileChildren: function(environment) {
      var children = environment.children, child, compiler;
      var compiled = [];

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new JavaScriptCompiler();

        compiled[i] = compiler.compile(child);
      }

      environment.rawChildren = children;
      environment.children = compiled;
    },

    pushStack: function(item) {
      this.source.push(this.nextStack() + " = " + item + ";");
      return "stack" + this.stackSlot;
    },

    nextStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return "stack" + this.stackSlot;
    },

    popStack: function() {
      return "stack" + this.stackSlot--;
    },

    topStack: function() {
      return "stack" + this.stackSlot;
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r') + '"';
    }
  }

  var reservedWords = ("break case catch continue default delete do else finally " +
                       "for function if in instanceof new return switch this throw " + 
                       "try typeof var void while with null true false").split(" ");

  compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

})(Handlebars.Compiler, Handlebars.JavaScriptCompiler)

Handlebars.VM = {
  programWithDepth: function(fn, helpers, partials, depth) {
    var args = [].slice.call(arguments, 1);
    return function(context) {
      return fn.apply(this, [context].concat(args));
    }
  },
  program: function(fn, helpers, partials) {
    return function(context) {
      return fn(context, helpers, partials);
    }
  },
  noop: function() {},
  compile: function(string) {
    var ast = Handlebars.parse(string);
    var environment = new Handlebars.Compiler().compile(ast);
    return new Handlebars.JavaScriptCompiler().compile(environment);
  },
  invokePartial: function(partial, name, context, helpers, partials) {
    if(partial instanceof Function) {
      return partial(context, helpers, partials)
    } else {
      partials[name] = Handlebars.VM.compile(partial);
      return partials[name](context, helpers, partials);
    }
  }
};;
// lib/handlebars.js
;

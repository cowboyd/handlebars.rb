module Handlebars
  class Template
    def initialize(context, fn)
      @context, @fn = context, fn
    end

    def call(*args, **kwargs)
      if args.length == 0
        invocation = "%s(%s)" % [@fn, kwargs.to_json]
      else
        raise "unsupported"
        invocation = "%s(%s)" % [@fn, args.to_json]
      end
      @context.eval(invocation)
    end
  end
end
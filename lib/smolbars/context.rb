require 'handlebars/source'
require 'mini_racer'
require 'securerandom'

module Smolbars
  class Context
    def initialize(**kwargs)
      @@snapshot ||= MiniRacer::Snapshot.new(File.read(Handlebars::Source.bundled_path))
      @js = MiniRacer::Context.new(kwargs.merge(snapshot: @@snapshot))
    end

    # Note that this is a hacky JS expression builder. We cannot pass JS AST in to mini_racer so we have to
    # hope the template passed in does not form invalid Ruby. So don't use templates with backtick characters without
    # manually escaping them
    def compile(template)
      if template.include?("`")
        raise RuntimeError.new("template cannot contain a backtick character '`'")
      end
      handle = fn_handle
      invocation = %Q{var #{handle} = Handlebars.compile(`#{template}`);}
      @js.eval(invocation)
      ::Smolbars::Template.new(self, handle)
    end

    def eval(*args)
      @js.eval(*args)
    end

    def load_pattern(pattern)
      Dir[pattern].each{ |path| load(path) }
    end

    def load(path)
      @js.load(path)
    end

    private

    def fn_handle
      "js_fn_#{SecureRandom.hex}"
    end
  end
end

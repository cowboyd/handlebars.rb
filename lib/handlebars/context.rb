require 'handlebars/source'
require 'mini_racer'
require 'securerandom'

module Handlebars
  class Context
    def initialize
      @js = MiniRacer::Context.new
      # @js['global'] = {} # there may be a more appropriate object to be used here @MHW
      @js.load(Handlebars::Source.bundled_path)

      # @partials = handlebars.partials = Handlebars::Partials.new
    end

    def fn_handle
      "js_fn_#{SecureRandom.hex}"
    end

    # Note that this is a hacky JS expression builder. We cannot pass JS AST in to mini_racer so we have to
    # hope the template passed in does not form invalid Ruby. So don't use templates with backtick characters without
    # manually escaping them
    def compile(template)
      handle = fn_handle
      invocation = %Q{var #{handle} = Handlebars.compile(`#{template}`);}
      @js.eval(invocation)
      ::Handlebars::Template.new(self, handle)
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

    def []=(key, value)
      data[key] = value
    end

    def [](key)
      data[key]
    end

    class << self
      attr_accessor :current
    end

    private

    def data
      handlebars[:_rubydata] ||= handlebars.create()
    end
  end
end

require 'handlebars/source'
require 'v8'

module Handlebars
  class Context
    def initialize
      @js = V8::Context.new
      @js['global'] = {} # there may be a more appropriate object to be used here @MHW
      @js.load(Handlebars::Source.bundled_path)

      @partials = handlebars.partials = Handlebars::Partials.new
    end

    def compile(*args)
      ::Handlebars::Template.new(self, handlebars.compile(*args))
    end

    def load_helpers(helpers_pattern)
      Dir[helpers_pattern].each{ |path| load_helper(path) }
    end

    def load_helper(path)
      @js.load(path)
    end

    def precompile(*args)
      handlebars.precompile(*args)
    end

    def register_helper(name, &fn)
      handlebars.registerHelper(name, fn)
    end

    def register_partial(name, content)
      handlebars.registerPartial(name, content)
    end

    def create_frame(data)
      handlebars.createFrame(data)
    end

    def partial_missing(&fn)
      @partials.partial_missing = fn
    end

    def handlebars
      @js.eval('Handlebars')
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

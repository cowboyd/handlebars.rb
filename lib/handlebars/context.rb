require 'handlebars/source'
require 'commonjs'
require 'v8'

module Handlebars
  class Context
    def initialize
      @js = CommonJS::Environment.new V8::Context.new, :path => [
        File.dirname(Handlebars::Source.bundled_path)
      ]

      @partials = handlebars.partials = Handlebars::Partials.new
    end

    def compile(*args)
      ::Handlebars::Template.new(self, handlebars.compile(*args))
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

    def partial_missing(&fn)
      @partials.partial_missing = fn
    end

    def handlebars
      @js.require('handlebars')
    end

    def runtime
      @js.runtime
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
      handlebars[:_rubydata] ||= @js.new_object
    end
  end
end

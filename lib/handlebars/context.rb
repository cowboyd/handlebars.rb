require 'commonjs'
require 'v8'

module Handlebars
  class Context
    def initialize
      @js = CommonJS::Environment.new V8::Context.new, :path => [
        File.expand_path('../../../vendor/bootstrap', __FILE__),
        File.expand_path('../../../vendor/handlebars/lib', __FILE__)
      ]

      # This is a slightly modified version of handlebars.js found in the main
      # distribution. The Ruby commonjs environment does not support full directory
      # requires, so we expand them by hand. Eventually this may be fixed upstream
      # but right now I'm not sure if this is a node-specific extension.

      @js.require('handlebars/base')
      @js.require('handlebars/utils')
      @js.require('handlebars/compiler/index')
      @js.require('handlebars/runtime')
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
      @js.require('handlebars/base')
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

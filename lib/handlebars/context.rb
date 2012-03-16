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
      for compiler_module in %w(ast base compiler index parser printer visitor)
        @js.require("handlebars/compiler/#{compiler_module}")
      end
      @js.require('handlebars/runtime')
    end
    
    def compile(*args)
      handlebars.compile(*args)
    end

    def register_helper(name, &fn)
      handlebars.registerHelper(name, fn)
    end

    def handlebars
      @js.require('handlebars/base')
    end

  end
end
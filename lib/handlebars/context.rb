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

    def compile(template)
      handle = fn_handle
      invocation = %Q{var #{handle} = Handlebars.compile(\"#{template}\");}
      @js.eval(invocation)
      ::Handlebars::Template.new(self, handle)
    end

    def eval(*args)
      @js.eval(*args)
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

    # TODO: this doesn't work well for callbacks because ruby can't call MiniRacer::JavaScriptFunction classes
    # https://github.com/rubyjs/mini_racer/issues/228
    def register_helper(name, &fn)
      ruby_fn_in_js_name = "registeredHelper_#{name}"
      @js.attach(ruby_fn_in_js_name, fn)
      invocation = %Q{Handlebars.registerHelper("%s", %s);} % [name, ruby_fn_in_js_name]
      @js.eval(invocation)
    end

    def register_partial(name, content)
      invocation = %Q{Handlebars.registerPartial("%s", "%s")} % [name, content]
      @js.eval(invocation)
    end

    def create_frame(data)
      handlebars.createFrame(data)
    end

    def partial_missing(&fn)
      @partials.partial_missing = fn
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

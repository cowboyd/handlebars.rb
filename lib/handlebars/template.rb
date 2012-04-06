module Handlebars
  class Template
    def initialize(context, fn)
      @context, @fn = context, fn
    end
    
    def call(*args)
      current = Handlebars::Context.current
      Handlebars::Context.current = @context
      @fn.call(*args)
    ensure
      Handlebars::Context.current = current
    end
  end
end
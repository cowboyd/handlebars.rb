require 'v8'
require 'multi_json'

module Handlebars
  
  V8::Context.new do |cxt|
    cxt.load(File.expand_path(File.join(File.dirname(__FILE__), '..','js','lib','handlebars.js')))
    @context = cxt
    @handlebars = cxt['Handlebars']
    cxt.eval <<-JS
      Handlebars.___compile = Handlebars.compile;
      Handlebars.compile = function(environment, options) {
        try {
          return Handlebars.___compile(environment, options);
        } catch(e) {
          return e.message;
        }
      };
    JS
  end
  
  class << self
    attr_reader :context
  end
  
  class CompiledTemplate
    
    def initialize(context, template)
      @context, @template = context, template
    end
    
    def call(data)
      json = MultiJson.encode(data)
      @context['template'] = @template
      @context.eval "template(#{json})"
    end
    
  end
  
  class RenderError < StandardError; end
  
  
  
  def self.precompile(template)
    @handlebars.precompile(template)
  end
  
  def self.load_precompiled(precompiled_template)
    template = Handlebars.context.eval "Handlebars.template(#{precompiled_template})"
    CompiledTemplate.new(@context, template)
  end
  
  def self.compile(*args)
    template = @handlebars.compile(*args)
    raise(RenderError, template) if template.is_a?(String)
    CompiledTemplate.new(@context, template)
  end
  
  def self.register_helper(name, fn)
    @handlebars.registerHelper(name, fn)
  end
  
  
  
end

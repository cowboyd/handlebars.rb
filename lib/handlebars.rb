
require 'v8'
require 'multi_json'

module Handlebars
  
  V8::Context.new do |cxt|
    cxt.load(File.expand_path(File.join(File.dirname(__FILE__), '..','js','lib','handlebars.js')))
    @context = cxt
    @handlebars = cxt['Handlebars']
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
  
  
  
  def compile(*args)
    Handlebars.module_eval do
      CompiledTemplate.new(@context, @handlebars.compile(*args))
    end
  end
  module_function :compile
  
  
  
  def registerHelper(name, fn)
    Handlebars.module_eval do
      @handlebars.registerHelper(name, fn)
    end
  end
  module_function :registerHelper
  
  
  
end

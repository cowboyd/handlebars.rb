
require 'v8'

module Handlebars
  
  V8::Context.new do |cxt|
    cxt.load(File.expand_path(File.join(File.dirname(__FILE__), '..','js','lib','handlebars.js')))
    @handlebars = cxt['Handlebars']
  end
  
  def compile(*args)
    Handlebars.module_eval do
      @handlebars.compile(*args)
    end
  end
  
  module_function :compile
end


require 'handlebars/loader'

module Handlebars

  @loader = Loader.new

  module_function

  def compile(*args)
    handlebars.compile(*args)
  end

  def register_helper(name, &fn)
    handlebars.registerHelper(name, fn)
  end

  def handlebars
    Handlebars.module_eval do
      @loader.require('handlebars')
    end
  end
end

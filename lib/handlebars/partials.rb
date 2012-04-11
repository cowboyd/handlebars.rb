module Handlebars
  class Partials
    attr_accessor :partial_missing

    def initialize
      @partials = {}
    end
    
    def []=(name, value)
      @partials[name.to_s] = value
    end
    
    def [](name)
      if @partials.has_key?(name.to_s)
        return @partials[name.to_s]
      elsif @partial_missing
        return @partial_missing[name]
      else
        yield
      end
    end
  end
end
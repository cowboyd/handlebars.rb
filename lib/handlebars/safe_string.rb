module Handlebars
  class SafeString
    def self.new(string)
      if context = Context.current
        context.handlebars['SafeString'].new(string)
      else
        warn "Cannot instantiate Handlebars.SafeString outside a running template Evaluation"
        string
      end
    end
  end
end

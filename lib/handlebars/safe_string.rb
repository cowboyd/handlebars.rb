module Handlebars
  class SafeString
    def self.new(string)
      if context = Context.current
        context.handlebars['SafeString'].new(string)
      else
        fail "Cannot instantiate Handlebars.SafeString outside a running template Evaluation"
      end
    end
  end
end
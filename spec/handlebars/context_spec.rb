require 'handlebars'

RSpec.describe Handlebars::Context do
  describe '.current=' do
    it 'is thread safe' do
      expect {
        Thread.new { Handlebars::Context.current = 'thread_context' }.join
      }.to_not change {
        Handlebars::Context.current
      }.from(nil)
    end
  end
end

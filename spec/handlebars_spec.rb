
require 'handlebars'
describe(Handlebars::Context) do

  describe "a simple template" do
    let(:t) {subject.compile("Hello {{name}}")}
    it "allows simple subsitution" do
      t.call(:name => 'World').should eql "Hello World"
    end

    it "allows Ruby blocks as a property" do
      t.call(:name => lambda {|context| ;"Mate"}).should eql "Hello Mate"
    end

    it "can use any Ruby object as a context" do
      t.call(mock(:Object, :name => "Flipper")).should eql "Hello Flipper"
    end
  end

  describe "registering Helpers" do
    before do
      subject.register_helper('alsowith') do |this, context, block|
        block.call(context)
      end
      subject.register_helper(:twice) do |this, block|
        "#{block.call}#{block.call}"
      end
    end

    it "correctly passes context and implementation" do
      t = subject.compile("it's so {{#alsowith weather}}*{{summary}}*{{/alsowith}}!")
      t.call(:weather => {:summary => "sunny"}).should eql "it's so *sunny*!"
    end

    it "doesn't nee a context or arguments to the call" do
      t = subject.compile("{{#twice}}Hurray!{{/twice}}")
      t.call.should eql "Hurray!Hurray!"
    end
  end

  describe "registering Partials" do
    before do
      subject.register_partial('legend', 'I am {{legend}}')
    end
    it "renders partials" do
      t = subject.compile("{{> legend}}").call(:legend => 'Legend!').should eql "I am Legend!"
    end
  end

  describe "creating safe strings from ruby" do
    let(:t) {subject.compile("{{safe}}")}
    it "respects safe strings returned from ruby blocks" do
      t.call(:safe => lambda {|this, *args| Handlebars::SafeString.new("<pre>totally safe</pre>")}).should eql "<pre>totally safe</pre>"
    end
  end
end

require 'handlebars'
describe(Handlebars) do

  before {extend Handlebars}

  describe "a simple template" do
    let(:t) {compile("Hello {{name}}")}
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
    Handlebars.register_helper('alsowith') do |context, block|
      block.call(context)
    end
    Handlebars.register_helper(:twice) do |block|
      "#{block.call}#{block.call}"
    end

    it "correctly passes context and implementation" do
      t = compile("it's so {{#alsowith weather}}*{{summary}}*{{/alsowith}}!")
      t.call(:weather => {:summary => "sunny"}).should eql "it's so *sunny*!"
    end

    it "doesn't nee a context or arguments to the call" do
      t = compile("{{#twice}}Hurray!{{/twice}}")
      t.call.should eql "Hurray!Hurray!"
    end
  end
end
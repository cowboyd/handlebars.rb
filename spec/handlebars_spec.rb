require 'handlebars'
describe(Handlebars::Context) do

  describe "a simple template" do
    let(:t) { compile("Hello {{name}}") }
    it "allows simple subsitution" do
      t.call(:name => 'World').should eql "Hello World"
    end

    it "allows Ruby blocks as a property" do
      t.call(:name => lambda { |context| ; "Mate" }).should eql "Hello Mate"
    end

    it "can use any Ruby object as a context" do
      t.call(double(:Object, :name => "Flipper")).should eql "Hello Flipper"
    end
  end

  describe "allows Handlebars whitespace operator" do
    let(:t) { compile("whitespace    {{~word~}}   be replaced.") }
    it "consumes all whitespace characters before/after the tag with the whitespace operator" do
      t.call(:word => "should").should eql "whitespaceshouldbe replaced."
    end
  end

  describe "loading Helpers" do
    before do
      subject.load_helper('spec/sample_helper.js')
    end

    it "can call helpers defined in a javascript file" do
      t = compile('{{#nthTimes 2}}yep {{/nthTimes}}hurrah!')
      t.call.should eql 'yep yep hurrah!'
    end
  end

  describe "registering Helpers" do
    before do
      subject.register_helper('alsowith') do |this, context, block|
        block.fn(context)
      end
      subject.register_helper(:twice) do |this, block|
        "#{block.fn}#{block.fn}"
      end
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

  describe "registering Partials" do
    before do
      subject.register_partial('legend', 'I am {{who}}')
    end
    it "renders partials" do
      compile("{{> legend}}").call(:who => 'Legend!').should eql "I am Legend!"
    end
  end

  describe "dynamically loading partial" do
    it "can be done with a string" do
      subject.partial_missing do |name|
        "unable to find >#{name}"
      end
      compile("I am {{>missing}}").call().should eql "I am unable to find >missing"
    end

    it "can be done with a function" do
      subject.partial_missing do |name|
        lambda do |this, context, options|
          "unable to find my #{name} #{context.what}"
        end
      end
      compile("I am {{>missing}}").call(:what => 'shoes').should eql "I am unable to find my missing shoes"
    end
  end

  describe "creating safe strings from ruby" do
    let(:t) { subject.compile("{{safe}}") }
    it "respects safe strings returned from ruby blocks" do
      t.call(:safe => lambda { |this, *args| Handlebars::SafeString.new("<pre>totally safe</pre>") }).should eql "<pre>totally safe</pre>"
    end
  end

  describe "context specific data" do
    before { subject['foo'] = 'bar' }
    it 'can be get and set' do
      subject['foo'].should eql 'bar'
    end
  end

  describe "precompiling templates" do
    let(:t) { precompile("foo {{bar}}") }
    it "should compile down to javascript" do
      t.should include 'function'
    end
  end

  describe "private variables" do
    let(:t) {subject.compile("{{#list array}}{{@index}}. {{title}} {{@dummy}}{{/list}}")}
    before do
      subject.register_helper('list') do |this, context, block|
        "<ul>" + context.each_with_index.map do |x, i|
          if block.keys.include? "data"
            data = subject.create_frame(block.data)
            data.index = i
            data.dummy = "dummy"
          end
          "<li>" + block.fn(x, data: data) + "</li>"
        end.join + "</ul>"
      end
    end
    it "sets the index variable correctly" do
      t.call(:array => [{:title => "You are"}, {:title => "He is"}]).should == "<ul><li>0. You are dummy</li><li>1. He is dummy</li></ul>"
    end
  end

  describe "hash arguments" do
    let(:t) {subject.compile(%({{#list nav id="nav-bar" class="top"}}<a href="{{url}}">{{title}}</a>{{/list}}))}
    before do
      subject.register_helper :list do |this, context, options|
        attrs = options[:hash].sort.map{|k,v| "#{k}=\"#{v}\""}.join(' ')
        "<ul #{attrs}>" + context.map{|item| "<li>" + options.fn(item) + "</li>"}.join + "</ul>"
      end
    end
    it "accepts hash attributes correctly" do
      t.call({nav: [{url: 'url', title: 'title'}]}).should == %(<ul class="top" id="nav-bar"><li><a href="url">title</a></li></ul>)
    end
  end

  def compile(*args)
    subject.compile(*args)
  end

  def precompile(*args)
    subject.precompile(*args)
  end
end

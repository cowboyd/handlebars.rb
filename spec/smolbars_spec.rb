require 'smobars'
describe(Smolbars::Context) do

  describe "a simple template" do
    let(:t) { compile("Hello {{name}}") }
    it "allows simple substitution" do
      t.call(:name => 'World').should eql "Hello World"
    end
  end

  describe "allows Handlebars whitespace operator" do
    let(:t) { compile("whitespace    {{~word~}}   be replaced.") }
    it "consumes all whitespace characters before/after the tag with the whitespace operator" do
      t.call(:word => "should").should eql "whitespaceshouldbe replaced."
    end
  end

  describe "sanity check templates" do
    let(:t) { compile("a very uncool `template`") }
    it "should raise an exception on backticks in the template" do
      expect { t }.to raise_error(RuntimeError)
    end

  end

  describe "loading Helpers" do
    before do
      subject.load('spec/sample_helper.js')
    end

    it "can call helpers defined in a javascript file" do
      t = compile('{{#nthTimes 2}}yep {{/nthTimes}}hurrah!')
      t.call.should eql 'yep yep hurrah!'
    end
  end

  describe "registering Helpers" do
    before do
      subject.load('spec/sample_helper.js')
    end

    it "correctly passes context and implementation" do
      t = compile("it's so {{#alsowith weather}}*{{summary}}*{{/alsowith}}!")
      t.call(:weather => {:summary => "sunny"}).should eql "it's so *sunny*!"
    end

    it "doesn't need a context or arguments to the call" do
      t = compile("{{#twice}}Hurray!{{/twice}}")
      t.call.should eql "Hurray!Hurray!"
    end
  end

  describe "registering partials" do
    before do
      subject.load('spec/sample_partials.js')
    end
    it "renders partials" do
      compile("{{> legend}}").call(:who => 'Legend!').should eql "I am Legend!"
    end
  end

  describe "hash arguments" do
    let(:t) {subject.compile(%({{#list nav id="nav-bar" class="top"}}<a href="{{url}}">{{title}}</a>{{/list}}))}
    before do
      subject.load("spec/sample_helper.js")
    end
    it "accepts hash attributes correctly" do
      t.call({nav: [{url: 'url', title: 'title'}]}).should == %(<ul class="top" id="nav-bar"><li><a href="url">title</a></li></ul>)
    end
  end

  describe "timeout" do
    subject { Smolbars::Context.new(timeout: 500) }
    before do
      subject.load("spec/sample_helper.js")
    end
    let(:t) {subject.compile(%({{#sleepy 1000}} time to sleep {{/sleepy}}))}

    it "should timeout" do
      skip "can't write async smolbars helpers"
      t.call.should == %()
    end

  end

  def compile(*args)
    subject.compile(*args)
  end

  def precompile(*args)
    subject.precompile(*args)
  end
end

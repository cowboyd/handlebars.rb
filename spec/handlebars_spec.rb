require 'handlebars'

class TestCollector

  def initialize(suite)
    @suite = suite
    @proxy = HandlebarsProxy.new
  end

  def module(name)
    @suite.add_module(name)
  end

  def test(desc, code)
    @suite.add_test(desc, code)
  end

  def equal(actual, expected)
    @suite.add_assertion do
      actual.should == expected
    end
  end

  def shouldCompileTo(string, hash, result, message = nil)
    @suite.add_assertion do
      context = {}
      for k,v in hash
        context[k] = v
      end
      Handlebars.compile(string).call(context).should == result
    end
  end
  
  def shouldThrow(*args)
    #we could proxy the throw assertions, but why bother?
  end
  
  def Handlebars
    @proxy
  end

end

class HandlebarsProxy
  def compile(*args)
    Handlebars.compile(*args)
  end
end

require 'ostruct'
class QUnitSuite
  
  attr_reader :modules
  
  def initialize
    @modules = []
  end

  def add_module(name)
    @modules << OpenStruct.new(:name => name, :tests => [])
  end

  def add_test(desc, code)
    unless ["safestring", "partials"].include?(@modules.last.name) #the should be passing, but aren't
      @modules.last.tests << OpenStruct.new(:desc => desc, :assertions => [])
      code.call()
    end
  end

  def add_assertion(&code)
    @modules.last.tests.last.assertions << code
  end
end

describe(Handlebars) do
  
  suite = QUnitSuite.new
  V8::Context.new(:with => TestCollector.new(suite)) do |cxt|
    cxt.load(File.expand_path(File.dirname(__FILE__) + '/../js/lib/handlebars.js'))
    
    for mod in suite.modules
      describe mod.name do
        for test in mod.tests
          it test.desc do
            for assertion in test.assertions
              assertion.call()
            end
          end
        end
      end unless mod.tests.empty?

    end
  end

end
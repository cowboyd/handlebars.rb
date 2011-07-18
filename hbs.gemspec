# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "handlebars/version"

Gem::Specification.new do |s|
  s.name        = "hbs"
  s.version     = Handlebars::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Charles Lowell"]
  s.email       = ["cowboyd@thefrontside.net"]
  s.homepage    = "http://github.com/cowboyd/handlebars.rb"
  s.summary     = %q{Ruby bindings for the handlebars.js templating library}
  s.description = %q{Uses the rubyracer bind in rails}

  s.rubyforge_project = "handlebars"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
  Dir.chdir("js") do
    s.files += `git ls-files`.split("\n").map {|f| "js/#{f}"}
    s.files += ['js/lib/handlebars/parser.js']
  end

  s.add_dependency "therubyracer", "~> 0.9.3beta1"
  s.add_development_dependency "rspec", "~> 2.0.0"
end

# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "handlebars/version"

Gem::Specification.new do |s|
  s.name        = "handlebars"
  s.version     = Handlebars::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Charles Lowell"]
  s.email       = ["cowboyd@thefrontside.net"]
  s.homepage    = "http://github.com/cowboyd/handlebars.rb"
  s.summary     = %q{Ruby bindings for the handlebars.js templating library}
  s.description = %q{Uses the actual JavaScript implementation of Handlebars, but supports using Ruby objects as template contexts and Ruby procs as view functions and named helpers}

  s.rubyforge_project = "handlebars"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency "therubyracer", "~> 0.11.1"
  s.add_dependency "commonjs", "~> 0.2.3"
  s.add_dependency "handlebars-source", "~> 1.0.12"
  s.add_development_dependency "rake"
  s.add_development_dependency "rspec", "~> 2.0"
end

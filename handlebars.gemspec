require "./lib/handlebars/version"

Gem::Specification.new do |s|
  s.name        = "handlebars"
  s.version     = Handlebars::VERSION
  s.authors     = ["Charles Lowell"]
  s.email       = ["cowboyd@thefrontside.net"]
  s.homepage    = "https://github.com/cowboyd/handlebars.rb"
  s.summary     = "Ruby bindings for the handlebars.js templating library"
  s.description = "Uses the actual JavaScript implementation of Handlebars, but supports using Ruby objects as template contexts and Ruby procs as view functions and named helpers"
  s.license     = "MIT"

  s.files         = `git ls-files lib README.mdown`.split("\n")

  s.add_dependency "therubyracer", "~> 0.12.2"
  s.add_dependency "handlebars-source", "~> 4.0.5"
  s.add_development_dependency "rake"
  s.add_development_dependency "rspec", "~> 2.0"
end

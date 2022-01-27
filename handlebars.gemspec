require "./lib/handlebars/version"

Gem::Specification.new do |s|
  s.name        = "handlebars"
  s.version     = Handlebars::VERSION
  s.authors     = ["Charles Lowell", "Xavier Lange"]
  s.email       = ["cowboyd@thefrontside.net"]
  s.homepage    = "https://github.com/cowboyd/handlebars.rb"
  s.summary     = "Ruby bindings for the handlebars.js templating library"
  s.description = "Uses the actual JavaScript implementation of Handlebars"
  s.license     = "MIT"

  s.files         = `git ls-files lib README.mdown`.split("\n")

  # s.add_dependency "therubyracer", "~> 0.12.1"
  s.add_dependency "mini_racer"
  s.add_dependency "handlebars-source"
  s.add_development_dependency "rake"
  s.add_development_dependency "rspec", "~> 2.0"
end

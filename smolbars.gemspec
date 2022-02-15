require "./lib/smolbars/version"

Gem::Specification.new do |s|
  s.name        = "smolbars"
  s.version     = Smolbars::VERSION
  s.authors     = ["Charles Lowell", "Xavier Lange"]
  s.email       = ["cowboyd@thefrontside.net"]
  s.homepage    = "https://github.com/cowboyd/smolbars.rb"
  s.summary     = "Ruby bindings for the smolbars.js templating library"
  s.description = "Uses the actual JavaScript implementation of Handlebars"
  s.license     = "MIT"

  s.files         = `git ls-files lib README.mdown`.split("\n")

  s.add_dependency "mini_racer" # we used to say 0.6, but let's try letting users pick what works
  s.add_dependency "handlebars-source", "~> 4"
  s.add_development_dependency "rake", "~> 13"
  s.add_development_dependency "rspec", "~> 2.0"
end

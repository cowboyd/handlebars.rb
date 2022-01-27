# 0.9.0

* Replace therubyracer with mini_racer
  * No more invoking Ruby from JS
  * We build templates through string concatentation. Do not pass in untrusted handlebars templates.
  * All data passed to JS environment is serialized with JSON
  * Remove support for partial_missing, it's deprecated since handlebars 4.3.0
  * Remove precompiling (doesn't seem useful in the ruby setting)
  * Remove setting data from ruby (use eval and do it yourself)
  * Remove support for SafeString (use eval and do it yourself)

# 0.8.0

* bumped handlebars-source version to 4.0.5

# 0.2.3

* expose precompilation method
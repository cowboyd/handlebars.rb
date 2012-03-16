require 'handlebars'

Handlebars.register_helper "table" do |block|
 "<table>#{block.call}</table>"
end

Handlebars.register_helper "row" do |block|
  "<tr class='awesome-row'>#{block.call}</tr>"
end

t = Handlebars.compile <<-HBS
{{#table width}}
  {{#row}}<td>Hi</td>{{/row}}
{{/table}}
HBS

puts t.call
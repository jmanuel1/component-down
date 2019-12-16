const { Remarkable } = require('remarkable');
const plugin = require('./plugin.js');
const customElementPlugin = require('./custom-element-plugin.js');

const md = new Remarkable({html: true});
md.use(customElementPlugin);
md.use(plugin);
console.log(md.render(`
{{% import "elements/elements.js" %}}

<div class="content-container">
  <div class="content">
    <paper-search-bar
      query="{{search}}"
      placeholder="Search"
      hide-filter-button
      items="{{_createItems(search)}}"
    >
    </paper-search-bar>
    <div id="search-results">

      {{% template is="dom-repeat" items="{{_createItems(search)}}" %}}
        <paper-card heading="{{item}}" elevation="2">
          <div class="card-content">
            Some card content 'cause <span>{{item}}</span>
          </div>
        </paper-card>
      {{% /template %}}

    </div>
  </div>
</div>`));

# Thoughts on adding web components to markdown

## Prior art

### https://mdxjs.com

Example from https://github.com/mdx-js/mdx.

```mdx
import { Chart } from '../components/chart'

# Here’s a chart

The chart is rendered inside our MDX document.

<Chart />
```

### https://github.com/osnr/markdown-it-jsx

Similar in syntax to MDX.js, but it transpiles to JSX which you must then
transpile yourself.

### https://github.com/probablyup/markdown-to-jsx/

This is a React component.

```jsx
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { render } from 'react-dom';
import { Chart } from '../components/chart';

const doc = `
# Here’s a chart

The chart is rendered inside our MDX document.

<Chart />
`;

render(
  <Markdown children={doc}
    options={{overrides: {Chart: {component: Chart}}} />,
  document.body
)
```

### Templating

#### [Hugo Shortcodes](https://gohugo.io/content-management/shortcodes/)

```markdown
# Here’s a chart

The chart is rendered inside our MDX document.

{{% Chart %}}
```

See also
https://www.smashingmagazine.com/2017/07/pattern-libraries-in-markdown/.


## Some code that uses web components

From https://github.com/jmanuel1/material-search:

```html
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
      <template is="dom-repeat" items="{{_createItems(search)}}">
        <paper-card heading="{{item}}" elevation="2">
          <div class="card-content">
            Some card content 'cause <span>{{item}}</span>
          </div>
        </paper-card>
      </template>
    </div>
  </div>
</div>
```

The component-down equivalent:

```markdown
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
</div>
```

In elements, code blocks cannot be created by indentation.

The import is used to get the JS which defines the custom elements. It is
equivalent to `<script type="module" src="elements/elements.js"></script>`.
/* Include tokens */
import "node_modules/@spectrum-css/tokens/dist/index.css";

/*
  For components with no other contexts available, load the
  index.css file from the component's package. These are components
  that do not have a spectrum or express context available.
*/
import "node_modules/@spectrum-css/page/dist/index.css";
import "node_modules/@spectrum-css/typography/dist/index.css";
import "node_modules/@spectrum-css/icon/dist/index.css";

/*
  Recommended: For components with multiple contexts available, if you
  want access to all contexts, load the index.css file, which includes
  all contexts and component variables.
*/
import "node_modules/@spectrum-css/button/dist/index.css";

/*
  If you only need the spectrum visual context: For components with
  multiple contexts available, load only the spectrum context by sourcing
  index-base.css and the spectrum theme from the themes directory.
*/
import "node_modules/@spectrum-css/button/dist/index-base.css";
import "node_modules/@spectrum-css/button/dist/themes/spectrum.css";
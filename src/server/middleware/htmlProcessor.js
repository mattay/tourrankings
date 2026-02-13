import beautify from "js-beautify";

/**
 * @type {typeof beautify.html}
 */
const beautifyHTML = beautify.html;

/**
 * Beautify options for HTML output
 * @type {import('js-beautify').HTMLBeautifyOptions}
 */
const beautifyOptions = {
  indent_size: 2,
  indent_char: " ",
  max_preserve_newlines: 0,
  preserve_newlines: true,
  indent_inner_html: true,
  end_with_newline: true,
  wrap_attributes: "auto",
  wrap_line_length: 120,
  unformatted: ["code", "pre", "textarea"],
  content_unformatted: ["pre", "textarea"],
  indent_scripts: "keep",
};

/**
 * Process HTML output - currently only beautifies
 * @param {string} html - Raw HTML string
 * @returns {string} Processed HTML
 */
function processHTML(html) {
  return beautifyHTML(html, beautifyOptions);
}

/**
 * Middleware to process HTML output
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function htmlProcessorMiddleware(req, res, next) {
  const originalRender = res.render;

  /**
   * Override render method to process HTML
   * @param {string} view - View name
   * @param {Object} [options] - Render options
   * @param {Function} [callback] - Callback function
   * @returns {void}
   */
  res.render = function (view, options, callback) {
    originalRender.call(this, view, options, (err, html) => {
      if (err) {
        return callback ? callback(err) : next(err);
      }

      try {
        const processed = processHTML(html);
        callback ? callback(null, processed) : res.send(processed);
      } catch (processingError) {
        // If processing fails, send original HTML
        console.error("HTML processing failed:", processingError);
        callback ? callback(null, html) : res.send(html);
      }
    });
  };

  next();
}

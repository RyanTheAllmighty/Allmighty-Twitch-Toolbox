Coding standards & styling guidelines
====================================

If you wish to submit any pull requests or contribute to this codebase in any way, please follow these coding standards.

Not following the Coding standards may result in you pull requests not being accepted.

Styling guidelines are just how we like to have things styled, mainly relating to doc blocks and comments. Pull requests won't be denied simply for not following these, but we appreciate them being followed.

### Coding standards
+ Please keep all line lengths to 200 characters and use 4 spaces rather than tab characters.
+ Please don't do large code commits. My preference is a single commit for a single fix/addition rather than bundled up commits.
+ Please document appropriately. While there is no need to put single line comments in for everything, having doc blocks and comments where necessary helps others see what the code does.

### Styling guidelines
For details on JSDoc used for all JavaScript files, see [this website](http://usejsdoc.org/).

+ Make sure all doc block information has a period at the end.
+ Make sure all doc block @ elements don't have a period at the end.
+ Make sure all comments not in doc blocks end in a period.
+ Make sure there is a blank line between any main doc block information and any @elements.
+ Make sure all callbacks are documented.

#### Example
    // Some comment. Which ends in a period.

    /**
     * Where the magic happens. Notice I end in a period.
     *
     * @param {string} arguments - All the arguments passed in from the command line, notice I don't end in a period
     */

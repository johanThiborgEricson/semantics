    
    /*
     * number:
     *   /\d+/
     * 
     * sum:
     *   number
     *   sum1
     *   sum2
     * 
     * sum1:
     *   sum + number
     * 
     * sum2:
     *   sum - number
     */
    
    var f = new InterpreterMethodFactory();
    var interpreter = {
      number: f.terminal(/\d+/, function(digits) {
        return Number(digits);
      }),
      
      sum: f.longest("number", "sum1", "sum2"), 
      
      sum1: f.group("sum", /\+/, "number", function(sum, number) {
        return sum + number;
      }),
      
      sum2: f.group("sum", /-/, "number", function(sum, number) {
        return sum - number;
      }),
      
    };
    
    console.log(interpreter.number("8+4-2-1"));  // 9
    
## Installation

Download this file to your project folder:
http://johanthiborgericson.github.io/semantics/src/InterpreterMethodFactory.js

And reference it in your project:
    
    &lt;html&gt;
      &lt;head&gt;
        &lt;script src="InterpreterMethodFactory.js"&gt;
      &lt;/head&gt;
    &lt;/html&gt;
    
## Semantics!, the foolproof interpreter factory

Semantics! is a foolproof JavaScript library for making parsers or interpreters. Unlike most parsing libraries, you don’t have to learn any library specific syntax to use it. Instead, it uses native JavaScript features to describe the rules of the interpreter/parser. Since there is no syntax, you never have to worry about syntax errors.

Also, unlike most parsing libraries, it only allows rules in their canonical form and simple quantifiers. Although this requires more code, it also greatly reduces the risk of making mistakes and, if a mistake is made, it is much easier to debug. Also, Semantics! uses semantic actions to make interpreters, and that would be messy if compound rules were allowed.

Semantics! is a Backrat parser with semantic actions that supports left recursion using an algorithm similar to the one described by Warth, Douglass and Millstein in “Packrat Parsers Can Support Left Recursion” that I accidentally reinvented. In plain English, this means: “It just works”.

## How to use Semantics!

The Semantics! library only has one public class, InterpreterMethodFactory. As the name suggests, it is a factory for producing methods that can interpret or parse text. Each produced method represents a production rule of the language. The methods are meant to be placed on an object created by the user that will be called the interpreter. Together, the interpreter methods of the interpreter object forms the language.

Now, let's look at this simple language for adding and subtracting numbers.

    number:
      /\d+/
    
    sum:
      number
      sum + number
      sum - number
    
This language says that a number is a sequence of digits. Further, a sum might be a number, but it might also be a sum followed by a plus sign or a minus sign followed by another number. As mentioned above, Semantics! only supports rules on canonical form and simple quantifiers. Therefore, we will have to rewrite the language. 

    number:
      /\d+/
    
    sum:
      number
      sum1
      sum2
    
    sum1:
      sum + number
    
    sum2:
      sum - number
    
Finally, Semantics doesn't support the concept of sequence or concatenation<sup>1</sup>, so we have to specify sum1 and sum2 as groups. 

    number:
      /\d+/
    
    sum:
      number
      sum1
      sum2
    
    sum1:
      (sum + number)
    
    sum2:
      (sum - number)

Now for the implementation. We will make an interpreter object with one method for each canonical rule in our language: sum, sum1, sum2 and number. The methods will be created using the factory methods longest, group and terminal of an interpreter method factory. 

    // An interpreter method factory to produce interpreter methods.
    var f = new InterpreterMethodFactory();
    // An interpreter object parsing and computing sums.
    var interpreter = {
      // Number parses one or more digits and interpret it as a positive number.
      number: f.terminal(/\d+/, function(digits) {
        return Number(digits);
      }),
      
      // A sum is a number, a sum1 or a sum2, whichever can parse the longest.
      sum: f.longest("number", "sum1", "sum2"), 
      
      // A sum1 is a sum followed by a plus sign and a number. 
      // This rule is evaluated by adding the number to the sum.
      sum1: f.group("sum", /\+/, "number", function(sum, number) {
        return sum + number;
      }),
      
      // A sum2 is a sum followed by a minus sign and a number. 
      // This rule is evaluated by subtracting the number from the sum.
      sum2: f.group("sum", /-/, "number", function(sum, number) {
        return sum - number;
      }),
      
    };

Note that the callback functions of sum 1 and 2 only get two values, even though they parses three symbols. This is because Semantics! is meant to be used to implement interpreters with semantic actions, not build parse trees. If you want to build a parse tree with the plus and minus signs, you must put them inside terminals. If you want to build a syntax tree, make the callback return a newly created Add or Subtract object.

I hope that this example implementation explains why Semantics! doesn't support compound rules such as the sum rule of the first language. If you really, really want compound rules, it should be fairly trivial to write a function that automates the process, something like this:

    // You have to write this function yourself, because
    // it is not foolproof.
    rule(interpreter, "sum", 
      "number", 
      ["sum", /\+/, "number", function(...) {...}], 
      ["sum", /-/, "number", function(...) {...}]);

Anyway, let's try the code. 

    console.log(interpreter.number("1"));  // 1
    console.log(interpreter.sum("1+2"));   // 3
    console.log(interpreter.sum("1+2-4")); // -1

Note that Semantics! has no concept of top symbol. The method you call will be treated as the top symbol. This allows for easy testing. 

## How does Semantics! work?

Semantics! can give quite extensive information of its inner working if you turn debugging messages on. This is done by adding true as the second parameter to the interpreter method (not to the factory method, mind you).

Calling

    interpreter.number("1", true);

will print this to console.log(), with my describing comments added:

    number      // start parsing the rule number
    1           // in the string 1
    ^           // at position 0
    /\d+/       // with the regex /\d+/ of the rule number
    number "1"  // number successfully parsed "1"

A more complex example:

    var f = new InterpreterMethodFactory();
    var interpreter = {
      ab: f.group("a", "b", function() {}),
      a: f.terminal(/a/, function() {}),
      b: f.terminal(/b/, function() {})
    };
    
    interpreter.ab("ab", true);

It will log, with my describing comments added.

    ab       // start parsing the rule ab
      a      // start parsing the rule a
    ab       // in the string ab
    ^        // at position 0
    /a/      // with the regex /a/ of rule a
      a "a"  // the rule a successfully parsed "a"
      b      // start parsing rule b
    ab       // in the string ab
     ^       // at position 1
    /b/      // with the regex /b/ of rule b
      b "b"  // the rule b successfully parsed "b"
    ab "ab"  // the rule ab successfully parsed "ab"

If you want to print the debugging messages of the sum rule described above, be warned. It uses left recursion which produces parse trees that aren't trivial to understand. But if you're in for a challenge, it is an informative study of how Packrat parsers can solve indirect left recursive definitions. 

## Comparison to other parsing libraries

Semantics! supports anonymous terminals. They correspond to terminals that would appeare in a parse tree but not in the syntax tree. Anonymous terminals are represented by regular expressions supplied when creating nonterminals, e. g. groups. If you want to build a parse tree, just use regular terminals instead of anonymous terminals.

By natively skipping all anonymous terminals that should not be in the syntax tree, it can be built without making a parse tree first. However, the syntax tree isn't a normal one. Normally, a syntax tree is a nested data structure with  typed nodes. In Semantics!, each node is instead represented by a function being called with the result of its child node functions. In Semantics!, each rule has its own function. This function is the equivalent of the type of a node in a normal syntax tree. An instance of a node type in an ordinary syntax tree differs from other instances by holding references to its child nodes. A Semantics! node differs from other nodes of the same type by being called with the result of its child nodes. Semantics! can build a syntax tree if all functions returns a newly created typed object with references to the results of its child node functions, which will then also be typed objects with references to … and so on. 

If you want to build a normal syntax tree you might find this extension useful: 
    
    (function() {
      
      // A function accepting an array ending with a function that replaces that 
      // function with that function turned into a constructor.
      function lastAsConstructor(args) {
        var Constructor = args[args.legnth-1];
        args[args.legnth-1] = function() {
          var object = Object.create(Constructor.prototype);
          var result = Constructor.apply(object, arguments);
          return result&&typeof result==="object"?result:object;
        };
        
        return args;
      }
      
      InterpreterMethodFactory.prototype.terminalNode = function() {
        return this.terminal.apply(this, lastAsConstructor(arguments));
      };
      
      InterpreterMethodFactory.prototype.nonterminalNode = function() {
        return this.group.apply(this, lastAsConstructor(arguments)); 
      };
      
    })();
    

<sup>1</sup> I am using the group concept rather than the sequence/concatenation concept, because you can do non-fooproof things with sequences and quantifiers. For example, Semantics doesn't have any equivalent of the regular expression `/ab*/`, ie a sequence of one a followed by zero or more as. A language described by Semantics! should either take this `/(ab*)/` or this `/(ab)*/` form. The name group is meant to emphasize this restriction.

## Run unit tests
<a href="../SpecRunner.html?inception=false">Run test cases</a>. It might be necessary to specify the path to the InterpreterMethodFactory.js file for the first test to run.

<a href="../SpecRunner.html">Run test cases inception style</a>. An interpreter built with Semantics! is used to interpret the source code of Semantics!. Then the test cases are run on that interpretation. Then the interpreter is built with the interpretation and the testcases of the interpreter is run on that. It should take approximately 50 times longer. If you are running the test cases from a local file (the file:// protocol), the test cases cant read the source code automatically, for security reasons, so you have to locate them manually. Otherwise the tests will run on the normal Semantics!.
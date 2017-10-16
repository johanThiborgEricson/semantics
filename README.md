## Semantics!, the foolproof interpreter factory

Semantics! is a foolproof JavaScript library for making parsers or interpreters. Unlike most parsing libraries, you don’t have to learn any library specific syntax to use it. Instead, it uses native JavaScript features to describe the rules of the interpreter/parser. Since there is no syntax, you never have to worry about syntax errors.

Also, unlike most parsing libraries, it only allows rules in their canonical form and simple quantifiers. Although this requires more code, it also greatly reduces the risk of making mistakes and, if a mistake is made, it is much easier to debug. Also, Semantics! uses semantic actions to make interpreters, and that would be messy if compound rules was allowed.

Semantics! is a Backrat parser with semantic actions that supports left recursion using an algorithm similar to the one described by Warth, Douglass and Millstein in “Packrat Parsers Can Support Left Recursion” that I accidentally reinvented. In plain English, this means: “It just works”.

## How to use Semantics!

The Semantics! library only has one public class, InterpreterMethodFactory. As the name suggests, it is a factory for producing methods that can interpret or parse text. Each produced method represents a production rule of the language. The methods are meant to be placed on an object created by the user that will be called the interpreter. Together, the interpreter methods of the interpreter object forms the language.

Now, let's look at this simple language for adding and subtracting numbers.

    sum:
      number
      sum + number
      sum - number
    
    number
      /\d+/

This language says that a sum might be a number, but it might also be a sum followed by a plus sign or a minus sign followed by another number. Further, a number is described as one or more digits. As mentioned above, Semantics! only supports rules on canonical form and simple quantifiers. Therefore, we will have to rewrite the language. 

    sum:
      number
      sum1
      sum2
    
    sum1:
      sum + number
    
    sum2:
      sum - number

    number
      /\d+/

Finally, Semantics doesn't support the concept of sequence or concatenation<sup>1</sup>, so we have to specify sum1 and sum2 as groups. 

    sum:
      number
      sum1
      sum2
    
    sum1:
      (sum + number)
    
    sum2:
      (sum - number)

    number
      /\d+/

Now for the implementation. We will make an interpreter object with one method for each canonical rule in our language: sum, sum1, sum2 and number. The methods will be created using the factory methods longest, group and atom of an interpreter method factory. 

    // An interpreter method factory to produce interpreter methods.
    var f = new InterpreterMethodFactory();
    // An interpreter object parsing and computing sums.
    var interpreter = {
      // A sum is a number, a sum1 or a sum2, whichever can parse the longest.
      sum: f.longest("number", "sum1", "sum2"), 
      // Number is a method that parses positive numbers.
      // It is evaluated by making a number out of the parsed string.
      number: f.atom(/\d+/, function(digits) {
        return Number(digits);
      })
      
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

Note that the callback functions of sum 1 and 2 only get two values, even though they parses three symbols. This is because Semantics! is meant to be used to implement interpreters with semantic actions, not build parse trees. If you want to build a parse tree with the plus and minus signs, you must put them inside atoms. If you want to build a syntax tree, make the callback return a newly created Add or Subtract object.

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

Note that Semantics has no concept of top symbol. The method you call will be treated as the top symbol. This allows for easy testing. 

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
      a: f.atom(/a/, function() {}),
      b: f.atom(/b/, function() {})
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

Semantics! isn't meant to build parse trees, although it can. It defines two type of terminals, one type that represents terminals that in some way will be part of the syntax tree, and one type that is forgotten immediately after it has been parsed, representing the leafs of the parse tree that would indicate the type of node in the syntax tree. The first type are the ones created by atoms, and the other type is the anonymous regular expressions of, e. g. groups. To build a parse tree, just use atoms instead of anonymous regexes.

By natively skipping all terminals that should not be in the syntax tree, it can be built without making a parse tree first. However, the syntax tree isn't a normal one. Normally, a syntax tree is a nested data structure with  typed nodes. In Semantics!, each node is instead represented by a function being called with the result of its child node functions. In Semantics!, each rule has its own function. This function is the equivalent of the type of a node in a normal syntax tree. An instance of a node type in an ordinary syntax tree differs from other instances by holding references to its child nodes. A Semantics! node differs from other nodes of the same type by being called with the result of its child nodes. Semantics! can build a syntax tree if all functions returns a newly created typed object with references to the results of its child node functions, which will then also be typed objects with references to … and so on. 

If you want to build a normal syntax tree you might find this extension useful: 
    
    (function() {
      
      // A function accepting an array ending with a function that replaces that 
      // function with that function turned into a constructor.
      function lastAsConstructor(args) {
        args[args.legnth-1] = function() {
          var Constructor = args[args.legnth-1];
          var object = Object.create(Constructor.prototype);
          var result = Constructor.apply(object, arguments);
          return result&&typeof result==="object"?result:object;
        };
        
      }
      
      InterpreterMethodFactory.prototype.terminalNode = function() {
        return this.atom.apply(this, lastAsConstructor(arguments));
      };
      
      InterpreterMethodFactory.prototype.nonterminalNode = function() {
        return this.group.apply(this, lastAsConstructor(arguments)); 
      };
      
    })();
    

<sup>1</sup> I am using the group concept rather than the sequence/concatenation concept, because you can do non-fooproof things with sequences and quantifiers. For example, Semantics doesn't have any equivalent of the regular expression /ab*/, ie a sequence of one a followed by zero or more as. A language described by Semantics! should either take this /(ab*)/ or this /(ab)*/ form. The name group is meant to emphasize this restriction.

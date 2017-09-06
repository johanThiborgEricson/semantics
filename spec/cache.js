describe("Parse result caching", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  
  beforeEach(function() {
    interpreter = {
      a: f.atom(/a/),
      b: f.atom(/b/),
      c: f.atom(/c/),
    };
    
  });
  
  it("remembers the result of parsing a terminal at the beginning of the code", 
  function() {
    f.parseCounter = function() {
      var parseCount = 0;
      var instructionMaker = function() {
        parseCount++;
        return (function(parseCount) {
          return function instruction() {
            return parseCount;
          };
          
        })(parseCount);
        
      };
      
      return this.makeMethod(instructionMaker);
    };
    
    interpreter.parseCounter = f.parseCounter();
    interpreter.doubleParseCounter = f.group("parseCounter", "parseCounter");
    
    expect(interpreter.doubleParseCounter("")).toEqual({
      parseCounter: [1, 1], 
    });
  });
  
  it("continues parsing after the cached object", function() {
    interpreter.ab = f.group("a", "b");
    interpreter.ac = f.group("a", "c");
    interpreter.abac = f.or("ab", "ac");
    
    expect(interpreter.abac("ac")).toEqual({a: "a", c: "c"});
  });
  
  it("only retrieves a cached result at the position in the code where it " + 
  "was cached", function() {
    interpreter.ab = f.atom(/a|b/);
    interpreter.ab2 = f.group("ab", "ab");
    
    expect(interpreter.ab2("ab")).toEqual({
      ab: ["a", "b"], 
    });
    
  });
  
  it("doesn't parse past anything if retreiving a cached parse failure", 
  function() {
    interpreter.ac = f.group(/a/, /c/);
    interpreter.ab = f.atom(/ab/);
    // At last!
    interpreter.acab = f.or("ac", "ab");
    interpreter.acacab = f.or("ac", "acab");
    expect(interpreter.acacab("ab")).toBe("ab");
  });
  
});

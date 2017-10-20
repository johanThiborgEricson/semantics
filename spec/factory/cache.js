describe("Parse result caching", function() {
  
  var f;
  var interpreter;
  
  beforeAll(function() {
    f = new InterpreterMethodFactory();
    
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
    
  });
  
  beforeEach(function() {
    interpreter = {
      a: f.terminal(/a/),
      b: f.terminal(/b/),
      c: f.terminal(/c/),
    };
    
  });
  
  it("remembers the result of parsing a terminal at the beginning of the code", 
  function() {
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
    interpreter.ab = f.terminal(/a|b/);
    interpreter.ab2 = f.group("ab", "ab");
    
    expect(interpreter.ab2("ab")).toEqual({
      ab: ["a", "b"], 
    });
    
  });
  
  it("doesn't parse past anything if retreiving a cached parse failure", 
  function() {
    interpreter.ac = f.group(/a/, /c/);
    interpreter.ab = f.terminal(/ab/);
    // At last!
    interpreter.acab = f.or("ac", "ab");
    interpreter.acacab = f.or("ac", "acab");
    expect(interpreter.acacab("ab")).toBe("ab");
  });
  
  it("can cache results of methods with wierd names", function() {
    var wierdName = "hasOwnProperty";
    interpreter[wierdName] = f.parseCounter();
    interpreter.doubleWierdName = f.group(wierdName, wierdName);
    
    var expected = {};
    expected[wierdName] = [1, 1];
    expect(interpreter.doubleWierdName("")).toEqual(expected);
  });
  
  it("restores the code pointer after returning a cached failed parsing", 
  function() {
    interpreter.ra = f.or("ra", "a");
    
    expect(interpreter.ra("a")).toBe("a");
  });
  
});

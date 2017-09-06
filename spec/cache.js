describe("Parse result caching", function() {
  
  var f = new InterpreterMethodFactory();
  var interpreter;
  
  beforeEach(function() {
    interpreter = {
      
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
  
});

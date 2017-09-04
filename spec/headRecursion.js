describe("Head recursion", function() {
  
  var f;
  var interpreter;
  var id = function(x) {
    return x;
  };
  
  var add = function(a, b) {
    return a+b;
  };
  
  beforeEach(function() {
    f = new InterpreterMethodFactory();
    interpreter = {};
    interpreter.a = f.atom(/a/);
    interpreter.b = f.atom(/b/);
  });
  
  it("parses each (non-)terminal twice", function() {
    var instructionMaker = jasmine.createSpy("instructionMaker")
    .and.returnValue(function(){});
    
    f.dummy = function() {
      return this.makeMethod(instructionMaker);
    };
    
    interpreter.dummy = f.dummy();
    
    interpreter.dummy("");
    
    expect(instructionMaker).toHaveBeenCalledTimes(2);
  });
  
});

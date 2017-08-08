describe("Head recursion", function() {
  
  var f = new InterpreterMethodFactory();
  var i;
  
  beforeEach(function() {
    i = {};
  });
  
  xit("doesn't cause an infinite loop", function() {
    i.a = f.terminal(/a/, function() {});
    i.aa = f.nonTerminalAlternative("aa0", "a");
    i.aa0 = f.nonTerminalSequence("aa", "a", function() {});
    
    expect(function() {
      i.aa("a");
    }).not.toThrow();
    
  });
  
  xit("can make one recursive call", function() {
    i.a = f.terminal(/a/, function() {});
    i.aa = f.nonTerminalAlternative("aa0", "a");
    i.aa0 = f.nonTerminalSequence("aa", "a", function() {});
    
    expect(function() {
      i.aa("aa");
    }).not.toThrow();
    
  });
  
});

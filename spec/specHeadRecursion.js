describe("Head recursion", function() {
  
  var f = new InterpreterMethodFactory();
  var i;
  var id = function(x) {
    return x;
  };
  
  beforeEach(function() {
    i = {};
  });
  
  it("doesn't cause an infinite loop", function() {
    i.a = f.terminal(/a/, function() {});
    i.aa = f.nonTerminalAlternative("aa0", "a");
    i.aa0 = f.nonTerminalSequence("aa", "a", function() {});
    
    expect(function() {
      i.aa("a");
    }).not.toThrow();
    
  });
  
  it("can make one recursive call", function() {
    i.a = f.terminal(/a/, function() {});
    i.aa = f.nonTerminalAlternative("aa0", "a");
    i.aa0 = f.nonTerminalSequence("aa", "a", function() {});
    
    expect(function() {
      i.aa("aa");
    }).not.toThrow();
    
  });
  
  it("can make two recursive calls", function() {
    i.a = f.terminal(/a/, function() {});
    i.aa = f.nonTerminalAlternative("aa0", "a");
    i.aa0 = f.nonTerminalSequence("aa", "a", function() {});
    
    expect(function() {
      i.aa("aaa");
    }).not.toThrow();
    
  });
  
  it("calls the interpretations in the expected order", function() {
    i.ad = f.terminal(/([a-d])/, id);
    i.ads = f.nonTerminalAlternative("ads0", "ad");
    i.ads0 = f.nonTerminalSequence("ads", "ad", function(ads, ad) {
      return ads+ad;
    });
    
    expect(i.ads("abcd")).toBe("abcd");
  });
  
});

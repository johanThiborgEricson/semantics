describe("Head recursion", function() {
  
  var f = new InterpreterMethodFactory();
  var i;
  var id = function(x) {
    return x;
  };
  
  var noop = function() {};
  
  beforeEach(function() {
    i = {};
    i.a = f.terminal(/a/, function() {});
    i.aa = f.nonTerminalAlternative("aa0", "a");
    i.aa0 = f.nonTerminalSequence("aa", "a", function() {});
    i.b = f.terminal(/b/, noop);
  });
  
  it("doesn't cause an infinite loop", function() {
    expect(function() {
      i.aa("a");
    }).not.toThrow();
    
  });
  
  it("can make one recursive call", function() {
    expect(function() {
      i.aa("aa");
    }).not.toThrow();
    
  });
  
  it("can make two recursive calls", function() {
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
  
  it("can occure at many places in a text", function() {
    i.aaxaa = f.nonTerminalSequence("aa", /x/, "aa", noop);
    
    expect(function() {
      i.aaxaa("axa");
    }).not.toThrow();
  });
  
  it("can choose between many heads", function() {
    i.aaabaa = f.nonTerminalAlternative("aaabaa1", "a", "b");
    i.aaabaa1 = f.nonTerminalSequence("aaabaa", "a");
    
    expect(function(){
      i.aaabaa("ba");
    }).not.toThrow();
  });
  
  it("can choose between many continuations", function() {
    i.abab = f.nonTerminalAlternative("abab1", "abab2", "a");
    i.abab1 = f.nonTerminalSequence("abab", "a", noop);
    i.abab2 = f.nonTerminalSequence("abab", "b", noop);
    
    expect(function() {
      i.abab("ab");
    }).not.toThrow();
  });
  
  it("doesn't parse the found base case as a continuation", function() {
    i.abbbbb = f.nonTerminalAlternative("abbbbb1", "a", "b");
    i.abbbbb1 = f.nonTerminalSequence("abbbbb", "b");
    
    expect(function(){
      i.abbbbb("aa");
    }).toThrowError("Trailing code: 'a'.");
  });
  
});

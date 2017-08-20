describe("Debugging messages", function() {
  var they = it;
  var xthey = xit;
  var interpreter;
  var factory = new InterpreterMethodFactory();
  
  beforeEach(function() {
    interpreter = {};
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.lineBreak = factory.terminal(/\n/, function() {});
    interpreter.paragraph = factory.nonTerminalSequence("text", "lineBreak");
    spyOn(console, "log");
  });
  
  they("can be turned on", function() {
    interpreter.text("text", true);
    
    expect(console.log).toHaveBeenCalled();
  });
  
  they("are turned off by default", function() {
    interpreter.text("text");
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("look like xml when called externaly", function() {
    interpreter.text("text", true);
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
  });
  
  they("indicate if parsing is successful when called externaly", function() {
    interpreter.text("text", true);
    
    expect(console.log).toHaveBeenCalledWith("Successfully parsed %s.", "text");
  });
  
  they("indicate if parsing is successful when called internaly", function() {
    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("Successfully parsed %s.", "text");
  });
  
  they("indicate if parsing has failed when called externaly", function() {
    try {
      interpreter.text("Something else", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("Failed to parse %s.", "text");
  });
  
  they("show the outer end tag, even on parse failure.", function() {
    try {
      interpreter.text("Something else", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
  });
  
  they("indicate if parsing has failed when called internaly", function() {

    try {
      interpreter.paragraph("Something else\n", true);
    } catch(e) {}
    
    
    expect(console.log).toHaveBeenCalledWith("Failed to parse %s.", "text");
  });
  
  they("aren't showed when called internally if turned off", function() {
    try {
      interpreter.paragraph("Something else\n");
    } catch(e) {}
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("look like xml when called internaly and externaly successfully", 
  function() {

    interpreter.paragraph("text\n", true);
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
    expect(console.log).toHaveBeenCalledWith("<%s>", "paragraph");
    expect(console.log).toHaveBeenCalledWith("</%s>", "paragraph");
  });
  
  they("look like xml when called internaly and externaly failing", function() {

    try {
      interpreter.paragraph("Something else\n", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
    expect(console.log).toHaveBeenCalledWith("<%s>", "paragraph");
    expect(console.log).toHaveBeenCalledWith("</%s>", "paragraph");
  });
  
  they("report matches", function() {
    interpreter.text("text", true);
    
    expect(console.log).toHaveBeenCalledWith("%s.exec(\"%s\")", "/text/", "text");
  });
  
  they("report the remaining code", function() {
    interpreter.foo = factory.terminal(/foo/, function() {});
    interpreter.bar = factory.terminal(/bar/, function() {});
    interpreter.fooBar = factory.nonTerminalSequence("foo", "bar", function(){});

    interpreter.fooBar("foobar", true);
    
    expect(console.log).toHaveBeenCalledWith("%s.exec(\"%s\")", "/bar/", "bar");
  });
  
  they("restrict the report to the end of the line", function() {
    interpreter.foo = factory.terminal(/foo/, function() {});
    interpreter.bar = factory.terminal(/bar/, function() {});
    interpreter.fooBar = factory.nonTerminalSequence("foo", /\n/, "bar", 
    function(){});

    interpreter.fooBar("foo\nbar", true);
    
    expect(console.log).toHaveBeenCalledWith("%s.exec(\"%s\")", "/foo/", "foo");
  });
  
  they("report match success", function() {
    interpreter.text("text", true);
    
    expect(console.log).toHaveBeenCalledWith("Matched \"%s\"", "text");
  });
  
  they("report match failures", function() {
    try {
      interpreter.text("Something else", true);
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("Match failed");
  });
  
  they("can tell the name of the called method, even if there are other " + 
  "methods with the same function", function() {
    interpreter.a1 = factory.terminal(/a/, function() {});
    interpreter.a2 = interpreter.a1;
    interpreter.aa = factory.nonTerminalSequence("a1", "a2", function() {});

    interpreter.aa("aa", true);
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "a1");
    expect(console.log).toHaveBeenCalledWith("<%s>", "a2");
  });
  
});

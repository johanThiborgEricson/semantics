describe("Debugging messages", function() {
  var they = it;
  var xthey = xit;
  
  they("can be turned on", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    factory.debugging = true;
    interpreter.text("text");
    
    expect(console.log).toHaveBeenCalled();
  });
  
  they("are turned off by default", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.text("text");
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("look like xml when called externaly", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    factory.debugging = true;
    interpreter.text("text");
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
  });
  
  they("indicate if parsing is successful when called externaly", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    factory.debugging = true;
    interpreter.text("text");
    
    expect(console.log).toHaveBeenCalledWith("Successfully parsed %s.", "text");
  });
  
  they("indicate if parsing is successful when called internaly", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.lineBreak = factory.terminal(/\n/, function() {});
    interpreter.paragraph = factory.nonTerminalSequence("text", "lineBreak");
    factory.debugging = true;
    interpreter.paragraph("text\n");
    
    expect(console.log).toHaveBeenCalledWith("Successfully parsed %s.", "text");
  });
  
  they("indicate if parsing has failed when called externaly", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    factory.debugging = true;
    try {
      interpreter.text("Something else");
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("Failed to parse %s.", "text");
  });
  
  they("show the outer end tag, even on parse failure.", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    factory.debugging = true;
    try {
      interpreter.text("Something else");
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
  });
  
  they("indicate if parsing has failed when called internaly", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.lineBreak = factory.terminal(/\n/, function() {});
    interpreter.paragraph = factory.nonTerminalSequence("text", "lineBreak");
    factory.debugging = true;
    try {
      interpreter.paragraph("Something else\n");
    } catch(e) {}
    
    
    expect(console.log).toHaveBeenCalledWith("Failed to parse %s.", "text");
  });
  
  they("aren't showed when called internally if turned off", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.lineBreak = factory.terminal(/\n/, function() {});
    interpreter.paragraph = factory.nonTerminalSequence("text", "lineBreak");
    factory.debugging = false;
    try {
      interpreter.paragraph("Something else\n");
    } catch(e) {}
    
    expect(console.log).not.toHaveBeenCalled();
  });
  
  they("look like xml when called internaly and externaly successfully", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.lineBreak = factory.terminal(/\n/, function() {});
    interpreter.paragraph = factory.nonTerminalSequence("text", "lineBreak");
    factory.debugging = true;
    interpreter.paragraph("text\n");
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
    expect(console.log).toHaveBeenCalledWith("<%s>", "paragraph");
    expect(console.log).toHaveBeenCalledWith("</%s>", "paragraph");
  });
  
  they("look like xml when called internaly and externaly failing", function() {
    var interpreter = {};
    var factory = new InterpreterMethodFactory();
    spyOn(console, "log");
    
    interpreter.text = factory.terminal(/text/, function() {});
    interpreter.lineBreak = factory.terminal(/\n/, function() {});
    interpreter.paragraph = factory.nonTerminalSequence("text", "lineBreak");
    factory.debugging = true;
    try {
      interpreter.paragraph("Something else\n");
    } catch(e) {}
    
    expect(console.log).toHaveBeenCalledWith("<%s>", "text");
    expect(console.log).toHaveBeenCalledWith("</%s>", "text");
    expect(console.log).toHaveBeenCalledWith("<%s>", "paragraph");
    expect(console.log).toHaveBeenCalledWith("</%s>", "paragraph");
  });
  
});

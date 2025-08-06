return (
  <Card className="mb-4 px-4 py-5 sm:px-5 sm:py-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
    <div className="text-center">
      <div className="flex justify-center mb-3">
        <Quote className="w-6 h-6 text-primary" />
      </div>

      <h2 className="text-xl md:text-2xl font-semibold text-primary mb-3">
        Daily Instruction
      </h2>

      <blockquote className="text-base md:text-lg leading-snug mb-4 font-serif text-foreground">
        "{instruction.text}"
      </blockquote>

      {instruction.authors && (
        <p className="text-sm text-muted-foreground mb-4">
          — {instruction.authors.name}
        </p>
      )}

      <div className="flex flex-col gap-4 justify-center items-center">
        {/* Navigation Controls */}
        <div className="flex gap-2 justify-center items-center">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            disabled={!canGoBack}
            className="bg-background/50 backdrop-blur-sm"
            title="Previous instruction"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="bg-background/50 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Get New Instruction
          </Button>

          <Button
            onClick={handleForward}
            variant="outline"
            size="sm"
            disabled={!canGoForward}
            className="bg-background/50 backdrop-blur-sm"
            title="Next instruction"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* History indicator */}
        {history.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {currentHistoryIndex + 1} of {history.length}
          </p>
        )}

        <ShareButtons
          text={`"${instruction.text}"${instruction.authors ? ` — ${instruction.authors.name}` : ""}`}
          url={`https://daily-wisdom.com?instruction=${instruction.id}`}
        />
      </div>
    </div>
  </Card>
);

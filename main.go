package main

import (
	"flag"
	"log"
	"net/http"
	"time"

	"github.com/ioixd/terminalwars/server"
)

func main() {
	addr := flag.String("l", ":2191", "http listen addr")
	flag.Parse()
	handler, err := server.New()
	if err != nil {
		log.Fatalln(err)
	}
	server := http.Server{
		Addr:        *addr,
		Handler:     handler,
		ReadTimeout: 5 * time.Second,
	}
	handler.Start()
	err = server.ListenAndServe()
	if err != nil {
		log.Fatalln(err)
	}
}

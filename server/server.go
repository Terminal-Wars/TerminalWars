package server

import (
	"html/template"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/ioixd/opendocs/server/websocket"
)

func New() (*Server, error) {
	s := new(Server)
	var err error
	s.tmpl, err = template.ParseGlob("templates/*.html")
	if err != nil {
		return nil, err
	}

	s.ws = websocket.NewHub()
	mux := chi.NewMux()
	mux.Get("/", s.getEditor)
	mux.Get("/blank", s.getBlank)
	mux.Method(http.MethodGet, "/socket", s.ws)
	mux.Handle("/*", http.FileServer(http.Dir("./root/")))
	s.mux = mux
	return s, nil
}

type Server struct {
	mux *chi.Mux

	ws   *websocket.Hub
	tmpl *template.Template
}

func (s *Server) Start() {
	go s.ws.Run()
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.mux.ServeHTTP(w, r)
}

func (s *Server) getEditor(w http.ResponseWriter, r *http.Request) {
	s.tmpl.ExecuteTemplate(w, "editor.html", nil)
}

func (s *Server) getBlank(w http.ResponseWriter, r *http.Request) {
	s.tmpl.ExecuteTemplate(w, "blank", nil)
}

{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.go
    pkgs.nodejs_20
    pkgs.nodePackages.nodemon
    pkgs.wails
  ];

  env = {
    PATH = [ "$HOME/go/bin" ];
  };

  idx = {
    extensions = [
      "golang.go"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          cwd = "frontend";
          command = [ "npm" "run" "dev-port" ];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    workspace = {
      onCreate = {
        # Setup wails3
        install-wails3 = "go install -v github.com/wailsapp/wails/v3/cmd/wails3@latest";
        # Generate bindings
        generate-bindings = "wails3 generate bindings";
        # Install npm deps
        npm-install = "cd frontend && npm install";
      };
      onStart = {
      };
    };
  };
}

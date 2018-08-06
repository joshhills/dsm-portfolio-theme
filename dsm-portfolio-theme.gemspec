# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "dsm-portfolio-theme"
  spec.version       = "0.1.1"
  spec.authors       = ["Josh Hills"]
  spec.email         = ["josh@jargonify.com"]

  spec.summary       = "A personalised portfolio site theme comprising of competency-based evaluations
                        and summaries of project work for university students studying a masters in data science program
                        at Newcastle University."
  spec.homepage      = "https://github.com/joshhills/dsm-portfolio/theme"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README)!i) }

  spec.add_runtime_dependency "jekyll", "~> 3.8"
  spec.add_runtime_dependency "jekyll-jupyter-notebook", "~> 0.0.3"
  
  spec.add_development_dependency "bundler", "~> 1.16"
  spec.add_development_dependency "rake", "~> 12.0"
end

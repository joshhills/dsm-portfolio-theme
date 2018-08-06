# TODO: Comment
module Jekyll
    class InjectGenerator < Generator
        safe true
        priority :highest
        
        def generate(site)
            # Select and group posts by subdirectory
            postsByProject = site.posts.docs.group_by { |post| post.id[/.*(?=\/)/] }

            # Iterate over groupings
            postsByProject.each do |grouping|
                projectId = grouping[0]
                projectFiles = grouping[1]

                projectUrls = {}

                # Give each file one-off values and assess availability.
                projectFiles.each do |file|
                    # Give each the project Id
                    file.data["projectId"] = projectId
                    # Give each the project title
                    file.data["projectTitle"] = file.data["title"][/.*(?=\/)/]
                    # Give each a type
                    file.data["type"] = file.basename_without_ext

                    projectUrls[file.data["type"]] = file.url
                end

                # Add singling URLs based on type.
                projectFiles.each do |file|
                    file.data["projectUrls"] = projectUrls
                end
            end
        end
    end
end
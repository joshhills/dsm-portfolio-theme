---
layout: page
---

<table>
    <tr>
        <th>Id</th>
        <th>Title</th>
        <th>Description</th>
        <th>Deadline</th>
        <th>Competencies</th>
    </tr>
    {% for project in site.data.projects %}
    <tr>
        <td>
            {{ project.id }}
        </td>
        <td>
            {{ project.title }}
        </td>
        <td>
            {{ project.description }}
        </td>
        <td>
            {{ project.deadline | date: "%d-%m-%Y" }}
        </td>
        <td>
            {% for competency in project.competencies %}
                {{ competency }}<br/>
            {% endfor %}
        </td>
    </tr>
    {% endfor %}
</table>
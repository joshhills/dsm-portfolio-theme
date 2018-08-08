---
layout: page
---

<table>
    <tr>
        <th>Id</th>
        <th>Title</th>
        <th>Categories</th>
    </tr>
    {% for competency in site.data.competencies %}
    <tr>
        <td>
            {{ competency.id }}
        </td>
        <td>
            {{ competency.title }}
        </td>
        <td>
            {% for category in competency.categories %}
                {{ category }}<br/>
            {% endfor %}
        </td>
    </tr>
    {% endfor %}
</table>
# This is the BRAIN of the entire project
# It evaluates conditions and decides next step

class RuleEngine:

    @staticmethod
    def evaluate_condition(condition, input_data):
        """
        Evaluates a condition string against input data
        Example:
          condition  = "amount > 100 && country == 'US'"
          input_data = {"amount": 250, "country": "US"}
          returns    = True
        """
        try:
            # Replace && with 'and', || with 'or'
            condition = condition.replace('&&', 'and')
            condition = condition.replace('||', 'or')

            # Replace contains/startsWith/endsWith
            # contains(field, 'value') → 'value' in field
            import re

            # Handle contains(field, 'value')
            condition = re.sub(
                r"contains\((\w+),\s*'([^']*)'\)",
                r"'\2' in str(\1)",
                condition
            )

            # Handle startsWith(field, 'prefix')
            condition = re.sub(
                r"startsWith\((\w+),\s*'([^']*)'\)",
                r"str(\1).startswith('\2')",
                condition
            )

            # Handle endsWith(field, 'suffix')
            condition = re.sub(
                r"endsWith\((\w+),\s*'([^']*)'\)",
                r"str(\1).endswith('\2')",
                condition
            )

            # Evaluate with input_data as context
            result = eval(condition, {"__builtins__": {}}, input_data)
            return bool(result)

        except Exception as e:
            print(f"Rule evaluation error: {e}")
            return False

    @staticmethod
    def get_next_step(step, input_data):
        """
        Given current step and input data,
        finds the next step to execute
        """
        # Get all rules sorted by priority
        rules = step.rules.all().order_by('priority')

        evaluated_rules = []

        for rule in rules:
            # Handle DEFAULT rule
            if rule.condition.strip().upper() == 'DEFAULT':
                evaluated_rules.append({
                    'rule': rule.condition,
                    'result': True,
                    'is_default': True
                })
                # Return default next step
                return rule.next_step, evaluated_rules

            # Evaluate condition
            result = RuleEngine.evaluate_condition(
                rule.condition,
                input_data
            )

            evaluated_rules.append({
                'rule': rule.condition,
                'result': result
            })

            # First matching rule wins
            if result:
                return rule.next_step, evaluated_rules

        # No rule matched
        return None, evaluated_rules